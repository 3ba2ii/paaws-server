import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { isAuth } from '../middleware/isAuth';
import { PhotoRepo } from '../repos/PhotoRepo.repo';
import { UpdootRepo } from '../repos/UpdootRepo.repo';
import { MyContext } from '../types';
import {
  CreateCommentInputType,
  CreateMissingPostInput,
  PaginationArgs,
} from '../types/inputTypes';
import {
  CommentResponse,
  CreateMissingPostResponse,
  MissingPostResponse,
  VotingResponse,
} from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { createBaseResolver } from '../utils/createBaseResolver';
import { Address } from './../entity/Address';
import { Comment } from './../entity/InteractionsEntities/Comment';
import { PostUpdoot } from './../entity/InteractionsEntities/PostUpdoot';
import { Photo } from './../entity/MediaEntities/Photo';
import { PostImages } from './../entity/MediaEntities/PostImages';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';
import {
  CREATE_INVALID_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from './../errors';
import { AddressRepo } from './../repos/AddressRepo.repo';
import { CommentRepo } from './../repos/CommentRepo.repo';
import { NotificationRepo } from './../repos/NotificationRepo.repo';
import { PostFilters } from './../types/inputTypes';
import { PaginatedMissingPosts } from './../types/responseTypes';
import {
  MissingPostTags,
  MissingPostTypes,
  NotificationType,
  SortingOrder,
} from './../types/types';
import { getLocationFilterBoundary } from './../utils/getLocationFilterBoundary';
import { getStartAndEndDateFilters } from './../utils/getStartAndEndDateFilters';

const MissingPostBaseResolver = createBaseResolver('MissingPost', MissingPost);

@Resolver(MissingPost)
class MissingPostResolver extends MissingPostBaseResolver {
  constructor(
    private readonly photoRepo: PhotoRepo,
    private readonly updootRepo: UpdootRepo,
    private readonly notificationRepo: NotificationRepo,
    private readonly addressRepo: AddressRepo,
    private readonly commentRepo: CommentRepo
  ) {
    super();
  }
  @FieldResolver(() => String)
  descriptionSnippet(
    @Root() { description }: MissingPost,
    @Arg('length', () => Int, { nullable: true }) length: number
  ) {
    if (!description) return null;
    let snippet = description.substring(0, length || 80);
    if (description.length > snippet.length) {
      snippet += '...';
    }
    return snippet;
  }
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() { id }: MissingPost,
    @Ctx() { req, dataLoaders: { votingLoader } }: MyContext
  ): Promise<number | null> {
    if (!req.session.userId) return null;

    const updoot = await votingLoader.load({
      postId: id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @FieldResolver(() => [MissingPostTags])
  async tags(@Root() { type }: MissingPost): Promise<MissingPostTags[]> {
    const tags: MissingPostTags[] = [];
    //1. check if the pet is missing or found
    if (type === MissingPostTypes.Missing) {
      tags.push(MissingPostTags.Missing);
    } else {
      tags.push(MissingPostTags.Found);
    }
    //2. get the distance between the current user and the missing post location
    //this can be done on the frontend as there is no need to load the missing post
    return tags;
  }

  @FieldResolver(() => User)
  user(
    @Root() { userId }: MissingPost,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User> {
    return userLoader.load(userId);
  }

  @FieldResolver(() => Address, { nullable: true })
  async address(
    @Root() { addressId }: MissingPost,
    @Ctx() { dataLoaders: { addressLoader } }: MyContext
  ): Promise<Address | undefined> {
    if (!addressId) return undefined;
    //we have the post id, we can load the images related to it
    return addressLoader.load(addressId);
  }

  @FieldResolver({ nullable: true })
  async images(
    @Root() { id }: MissingPost,
    @Ctx() { dataLoaders: { postImagesLoader } }: MyContext
  ): Promise<PostImages[]> {
    //we have the post id, we can load the images related to it

    return postImagesLoader.load(id);
  }

  @FieldResolver({ nullable: true })
  async thumbnail(
    @Root() { thumbnailId }: MissingPost,
    @Ctx() { dataLoaders: { photoLoader } }: MyContext
  ): Promise<Photo | undefined> {
    //we have the post id, we can load the images related to it
    return photoLoader.load(thumbnailId);
  }
  private createDateFiltersRawSql(filters: PostFilters) {
    let rawSql = '';
    if (filters) {
      if (filters.date) {
        const { startDate, endDate } = getStartAndEndDateFilters(filters.date);
        // we add the filters to the query builder only if the start date is not null
        if (!startDate) return;
        rawSql += `(mp."createdAt" BETWEEN '${startDate.toISOString()}' and '${endDate.toISOString()}')`;
      }
    }
    return rawSql;
  }

  @Query(() => PaginatedMissingPosts)
  async missingPosts(
    @Arg('input') { limit, cursor }: PaginationArgs,
    @Arg('type', () => MissingPostTypes, {
      nullable: true,
      defaultValue: MissingPostTypes.ALL,
    })
    type: MissingPostTypes,
    @Arg('filters', () => PostFilters, { nullable: true }) filters: PostFilters
  ): Promise<PaginatedMissingPosts> {
    const realLimit = Math.min(20, limit ? limit : 10);
    const realLimitPlusOne = realLimit + 1;

    let posts = getConnection()
      .getRepository(MissingPost)
      .createQueryBuilder('mp');

    //filtering by type of post
    if (type && type !== MissingPostTypes.ALL)
      posts.andWhere('mp.type = :type', { type });

    //filtering by date
    const dateRawSQL = this.createDateFiltersRawSql(filters);

    if (dateRawSQL && dateRawSQL.length > 2) {
      posts.andWhere(dateRawSQL);
    }

    const loc = filters.location;
    //filtering by location
    if (loc && loc.lat && loc.lng && loc.locationFilter) {
      const { lat, lng, locationFilter } = loc;
      posts.andWhere((qb) => {
        const locationRadius = getLocationFilterBoundary(locationFilter);

        const subQuery = qb
          .subQuery()
          .select('address.id')
          .from(Address, 'address'); // we get the address id

        subQuery.where(
          `( 6371 *
              acos(cos(radians(${lat})) * 
              cos(radians(lat)) * 
              cos(radians(lng) - 
              radians(${lng})) + 
              sin(radians(${lat})) * 
              sin(radians(lat)))) < ${Math.min(locationRadius, 100)}`
        );

        return `"addressId" IN (${subQuery.getQuery()})`;
      });
    }

    //add cursor for pagination
    if (cursor) {
      posts.andWhere('mp."createdAt" < :cursor', {
        cursor: new Date(cursor),
      });
    }

    const order = filters.order === SortingOrder.ASCENDING ? 'ASC' : 'DESC';

    const results = await posts
      .orderBy('mp."createdAt"', order)
      .limit(realLimitPlusOne)
      .getMany();

    return {
      missingPosts: results.slice(0, realLimit),
      hasMore: results.length === realLimitPlusOne,
    };
  }

  @Query(() => MissingPostResponse)
  async missingPost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<MissingPostResponse> {
    try {
      const userId = req.session.userId;
      const missingPost = await MissingPost.findOne(id);
      if (!missingPost) return { errors: [CREATE_NOT_FOUND_ERROR('post')] };

      const isOwner = userId ? missingPost.userId === userId : false;

      return { missingPost, isOwner };
    } catch (e) {
      return {
        errors: [
          INTERNAL_SERVER_ERROR,
          { code: 500, field: 'server', message: e.message },
        ],
      };
    }
  }

  @Mutation(() => CreateMissingPostResponse)
  @UseMiddleware(isAuth)
  async createMissingPost(
    @Ctx() { req }: MyContext,
    @Arg('input')
    {
      address,
      description,
      privacy,
      title,
      type,
      thumbnailIdx,
    }: CreateMissingPostInput,
    @Arg('images', () => [GraphQLUpload]) images: Upload[]
  ): Promise<CreateMissingPostResponse> {
    const userId = req.session.userId;

    const user = await User.findOne(userId);

    if (!userId || !user)
      return {
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };

    //1. Create the location
    const missingPost = MissingPost.create({
      title,
      description,
      type,
      privacy,
      user,
    });
    //2. Create the address
    if (address) {
      const new_address = await this.addressRepo.createFormattedAddress({
        ...address,
      });
      if (new_address) missingPost.address = new_address;
    }
    //3. Create the images - this will create the photos
    let resolvedPhotos: Photo[] = [];
    await Promise.all(
      images.map(async (image) => {
        const { photo, errors } = await this.photoRepo.createPhoto(
          image,
          userId
        );
        if (!errors?.length && photo) resolvedPhotos.push(photo);
      })
    );
    const postImages = resolvedPhotos.map((photo) => {
      return PostImages.create({ photo, postId: missingPost.id });
    });

    //4. Associate the thumbnail if exists
    if (typeof thumbnailIdx === 'number')
      missingPost.thumbnail = postImages[thumbnailIdx].photo;

    missingPost.images = postImages;

    //5. save the post and the images
    const success = await getConnection().transaction(async () => {
      await missingPost.save(); // save the missing post to get the address
      return true;
    });

    if (!success)
      return {
        errors: [INTERNAL_SERVER_ERROR],
      };

    if (address && address?.lat && address?.lng) {
      //1. get the nearest 20 users
      const nearbyUsers = await this.addressRepo.findNearestUsers(
        address.lat,
        address.lng,
        2
      );

      //2. send them a notification that there is a pet missing around them
      nearbyUsers?.forEach((receiver) => {
        this.notificationRepo.createNotification({
          performer: user,
          content: missingPost,
          receiver,
          notificationType: NotificationType.MISSING_PET_AROUND_YOU,
        });
      });
    }

    return { post: missingPost };
  }

  @Mutation(() => VotingResponse)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<VotingResponse> {
    /** There is two cases to cover here
     *  1. User has not voted for this post before -> Create a new vote and increase/decrease the points by one (TRANSACTION)
     *  2. User has voted for this post
         2.1 User has changed his vote -> Update the current vote and increase/decrease the points by two (TRANSACTION)
         2.2 User has not changed his vote -> Do Nothing
      */

    //check if value is only 1 or -1
    if (![-1, 1].includes(value))
      return { errors: [CREATE_INVALID_ERROR('value')], success: false };
    const isUpvote = value === 1;

    const { userId } = req.session;
    const post = await MissingPost.findOne(postId);
    if (!post)
      return { errors: [CREATE_NOT_FOUND_ERROR('post')], success: false };

    const user = await User.findOne(userId);
    if (!user)
      return { errors: [CREATE_NOT_FOUND_ERROR('user')], success: false };

    const updoot = await PostUpdoot.findOne({ where: { postId, userId } });

    let votingRes: VotingResponse;
    if (!updoot) {
      //1. User has not voted for this post before
      votingRes = await this.updootRepo.createUpdoot({
        updootTarget: PostUpdoot,
        entity: post,
        user,
        value,
        type: 'post',
      });
    } else if (updoot.value !== value) {
      //2 User has voted for this post before and has changed his vote

      votingRes = await this.updootRepo.updateUpdootValue({
        updoot,
        entity: post,
        value,
      });
    } else {
      //2. User has not changed his vote so he want to delete it
      votingRes = await this.updootRepo.deleteUpdoot(updoot, post);
    }

    if (votingRes.success) {
      this.notificationRepo.createNotification({
        performer: user,
        content: post,
        receiverId: post.userId,
        notificationType: isUpvote
          ? NotificationType.UPVOTE
          : NotificationType.DOWNVOTE,
      });
    }

    return votingRes;
  }
  @Mutation(() => CommentResponse)
  @UseMiddleware(isAuth)
  async comment(
    @Arg('input') commentInfo: CreateCommentInputType,
    @Ctx() { req }: MyContext
  ): Promise<CommentResponse> {
    const isReply = commentInfo.parentId !== null;
    const { userId } = req.session;
    const user = await User.findOne(userId);
    if (!user)
      return {
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };
    /* Two cases to cover here
       1. User is commenting on a post
       2. User is replying to a comment   
    */
    const post = await MissingPost.findOne(commentInfo.postId);
    if (!post) return { errors: [CREATE_NOT_FOUND_ERROR('post')] };

    let response: CommentResponse;
    let parentComment: Comment | undefined;
    if (isReply) {
      //we have to find the parent comment
      parentComment = await Comment.findOne(commentInfo.parentId);
      if (!parentComment)
        return { errors: [CREATE_NOT_FOUND_ERROR('comment')] };
      response = await this.commentRepo.reply(
        commentInfo,
        parentComment,
        post,
        user.id
      );
    } else {
      response = await this.commentRepo.comment(commentInfo, post, user.id);
    }

    /*
    Two cases for comment:
    1. User is commenting on a post -> send a notification to the user who posted the post
    2. User is replying to a comment -> send a notification to the user owns the parent comment and the post owner as well

    so either ways we will send a notification to the post owner
    */
    if (response?.errors?.length === 0)
      this.notificationRepo.createNotification({
        performer: user,
        content: post,
        receiverId: post.userId, //post owner
        notificationType: NotificationType.COMMENT_NOTIFICATION,
      });
    //if its a reply we also need to send a notification to the user who commented on the parent comment that someone has replied to his comment

    parentComment &&
      this.notificationRepo.createNotification({
        performer: user,
        content: post,
        receiverId: parentComment.userId, //comment owner
        notificationType: NotificationType.REPLY_NOTIFICATION,
      });
    return response;
  }
}

export default MissingPostResolver;
