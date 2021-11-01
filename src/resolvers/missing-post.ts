import { createWriteStream } from 'fs';
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
import { NotificationRepo } from './../repos/NotificationRepo.repo';
import { PaginatedMissingPosts } from './../types/responseTypes';
import {
  MissingPostTags,
  MissingPostTypes,
  NotificationType,
} from './../types/types';

const MissingPostBaseResolver = createBaseResolver('MissingPost', MissingPost);

@Resolver(MissingPost)
class MissingPostResolver extends MissingPostBaseResolver {
  constructor(
    private readonly photoRepo: PhotoRepo,
    private readonly updootRepo: UpdootRepo,
    private readonly notificationRepo: NotificationRepo,
    private readonly addressRepo: AddressRepo
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

  @Query(() => PaginatedMissingPosts)
  async missingPosts(
    @Arg('input') { limit, cursor }: PaginationArgs
  ): Promise<PaginatedMissingPosts> {
    const realLimit = Math.min(20, limit ? limit : 10);
    const realLimitPlusOne = realLimit + 1;

    let posts = getConnection()
      .getRepository(MissingPost)
      .createQueryBuilder('mp');

    if (cursor)
      posts.andWhere('mp."createdAt" < :cursor', {
        cursor: new Date(cursor),
      });

    const results = await posts
      .orderBy('mp."createdAt"', 'DESC')
      .limit(realLimitPlusOne)
      .getMany();

    return {
      missingPosts: results.slice(0, realLimit),
      hasMore: results.length === realLimitPlusOne,
    };
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
    if (!user)
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
    //3. Create the images
    const resolvedStreams = await this.photoRepo.getMultipleImagesStreams(
      images
    );
    const postImages = resolvedStreams.map(
      ({ filename, uniqueFileName }, idx) => {
        let isThumbnail = false;
        if (typeof thumbnailIdx === 'number' && thumbnailIdx === idx) {
          isThumbnail = true;
        }
        return PostImages.create({
          photo: Photo.create({
            filename,
            path: uniqueFileName,
            creator: user,
            isThumbnail,
          }),
          postId: missingPost.id,
        });
      }
    );
    //
    //4. Associate the thumbnail if exists
    if (typeof thumbnailIdx === 'number')
      missingPost.thumbnail = postImages[thumbnailIdx].photo;

    missingPost.images = postImages;

    //5. save the post and the images
    const success = await getConnection().transaction(async (_) => {
      await Promise.all(
        resolvedStreams.map((s) => {
          const { stream, pathName } = s;

          return stream.pipe(createWriteStream(pathName));
        })
      );
      await missingPost.save();
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
    @Arg('input') { postId, text, parentId }: CreateCommentInputType,
    @Ctx() { req }: MyContext
  ): Promise<CommentResponse> {
    const isReply = parentId != null;
    const { userId } = req.session;
    const user = await User.findOne(userId);
    if (!user)
      return {
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };

    const post = await MissingPost.findOne(postId);
    if (!post) {
      return {
        errors: [CREATE_NOT_FOUND_ERROR('post')],
      };
    }
    /* Two cases to cover here
       1. User is commenting on a post
       2. User is replying to a comment   
    */

    let comment: Comment;
    let parentComment: Comment | undefined;

    if (!isReply) {
      //1. User is commenting on a post
      comment = Comment.create({
        text,
        user,
        post,
      });
    } else {
      //2. User is replying to a comment
      parentComment = await Comment.findOne(parentId);

      //check if the parent comment exists and it is on the same post
      if (!parentComment || parentComment.postId !== postId) {
        return {
          errors: [CREATE_NOT_FOUND_ERROR('comment')],
        };
      }
      if (parentComment.parentId != null) {
        //then the parent comment is a reply (we only allow two levels of nesting)
        //create a comment with the grandparent comment as parent for the new comment
        const grandParentComment = await Comment.findOne(
          parentComment.parentId
        );
        if (!grandParentComment) {
          return {
            errors: [CREATE_NOT_FOUND_ERROR('Grandparent')],
          };
        }
        comment = Comment.create({
          text,
          user,
          post,
          parentId: grandParentComment.id,
        });
        parentComment = grandParentComment;
      } else {
        //then the parent comment is a top level comment
        comment = Comment.create({
          text,
          user,
          post,
          parentId: parentComment.id,
        });
      }
    }
    await comment.save();
    /*
    Two cases for comment:
    1. User is commenting on a post -> send a notification to the user who posted the post
    2. User is replying to a comment -> send a notification to the user owns the parent comment and the post owner as well

    so either ways we will send a notification to the post owner
    */

    if (parentComment != null) {
      this.notificationRepo.createNotification({
        performer: user,
        content: post,
        receiverId: parentComment.userId, //comment owner
        notificationType: NotificationType.REPLY_NOTIFICATION,
      });
    }
    this.notificationRepo.createNotification({
      performer: user,
      content: post,
      receiverId: post.userId, //post owner
      notificationType: NotificationType.COMMENT_NOTIFICATION,
    });

    return { comment };
  }
}

export default MissingPostResolver;
