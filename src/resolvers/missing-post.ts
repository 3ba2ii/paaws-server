import { PaginatedMissingPosts } from './../types/response.types';
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
import { getConnection, getRepository, SelectQueryBuilder } from 'typeorm';
import { isAuth } from '../middleware/isAuth';
import { PhotoRepo } from '../repos/PhotoRepo.repo';
import { MyContext } from '../types';
import {
  CreateMissingPostInput,
  PaginationArgs,
  UpdateMissingPostInput,
} from '../types/input.types';
import {
  CreateMissingPostResponse,
  EditMissingPostResponse,
  MissingPostResponse,
} from '../types/response.types';
import { Upload } from '../types/Upload';
import { createBaseResolver } from '../utils/createBaseResolver';
import { Address } from './../entity/Address';
import { Photo } from './../entity/MediaEntities/Photo';
import { PostImages } from './../entity/MediaEntities/PostImages';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';
import {
  CREATE_NOT_AUTHORIZED_ERROR,
  CREATE_NOT_FOUND_ERROR,
  INTERNAL_SERVER_ERROR,
} from './../errors';
import { AddressRepo } from './../repos/AddressRepo.repo';
import { NotificationRepo } from './../repos/NotificationRepo.repo';
import { PostFilters } from '../types/input.types';
import {
  MissingPostTags,
  MissingPostTypes,
  NotificationType,
  SortingOrder,
} from '../types/enums.types';
import { getLocationFilterBoundary } from './../utils/getLocationFilterBoundary';
import { getStartAndEndDateFilters } from './../utils/getStartAndEndDateFilters';

const MissingPostBaseResolver = createBaseResolver('MissingPost', MissingPost);

@Resolver(MissingPost)
class MissingPostResolver extends MissingPostBaseResolver {
  constructor(
    private readonly photoRepo: PhotoRepo,
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
    } else if (type === MissingPostTypes.Found) {
      tags.push(MissingPostTags.Found);
    } else if (type === MissingPostTypes.Rescued) {
      tags.push(MissingPostTags.Rescued);
    }
    //2. get the distance between the current user and the missing post location
    //this can be done on the frontend as there is no need to load the missing post
    return tags;
  }
  //
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
    if (!thumbnailId) return undefined;
    //we have the post id, we can load the images related to it
    return photoLoader.load(thumbnailId);
  }

  private async filterMPByDate(
    filters: PostFilters,
    posts: SelectQueryBuilder<MissingPost>
  ): Promise<SelectQueryBuilder<MissingPost>> {
    let rawSql = '';
    if (filters && filters.date) {
      const { startDate, endDate } = getStartAndEndDateFilters(filters.date);
      // we add the filters to the query builder only if the start date is not null
      if (!startDate) return posts;
      rawSql += `(mp."createdAt" BETWEEN
         '${startDate.toISOString()}' and '${endDate.toISOString()}')`;
    }
    return rawSql === '' ? posts : posts.andWhere(rawSql);
  }

  private async filterMPByLocation(
    filters: PostFilters,
    posts: SelectQueryBuilder<MissingPost>
  ): Promise<SelectQueryBuilder<MissingPost>> {
    try {
      if (filters && filters.location) {
        const { lat, lng, locationFilter } = filters.location;
        if (!lat || !lng || !locationFilter) return posts;
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

      return posts;
    } catch (e) {
      console.error(e.message);
    } finally {
      return posts;
    }
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
    posts = await this.filterMPByDate(filters, posts);

    //filtering by location
    posts = await this.filterMPByLocation(filters, posts);

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

  @Query(() => PaginatedMissingPosts)
  async missingPostsByUser(
    @Arg('input') { limit, cursor }: PaginationArgs,
    @Arg('userId', () => Int) userId: number
  ): Promise<PaginatedMissingPosts> {
    const realLimit = Math.min(20, limit ? limit : 10);
    const realLimitPlusOne = realLimit + 1;

    let posts = getConnection()
      .getRepository(MissingPost)
      .createQueryBuilder('mp')
      .where('mp.userId = :userId', { userId });

    if (cursor) {
      posts.andWhere('mp."createdAt" < :cursor', {
        cursor: new Date(cursor),
      });
    }

    const results = await posts
      .orderBy('mp."createdAt"', 'DESC')
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
      showEmail,
      showPhoneNumber,
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
      showEmail: !!showEmail,
      showPhoneNumber: !!showPhoneNumber,
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

    //Update missingPosts count for the user
    user.missingPostsCount += 1;

    //5. save the post and the images
    const success = await getConnection()
      .transaction(async () => {
        await missingPost.save(); // save the missing post to get the address
        await user.save;
        return true;
      })
      .catch(() => false);

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

  @Mutation(() => EditMissingPostResponse)
  @UseMiddleware(isAuth)
  async editMissingPost(
    @Arg('id', () => Int) id: number,
    @Arg('input', () => UpdateMissingPostInput)
    input: Partial<UpdateMissingPostInput>,
    @Ctx() { req }: MyContext
  ): Promise<EditMissingPostResponse> {
    /* User can update the following data only
      1. description
      2. privacy
      3. type
      4. title
      5. showContactInfo
    */
    const userId = req.session.userId;
    const missingPost = await MissingPost.findOne(id);
    if (!missingPost) return { errors: [CREATE_NOT_FOUND_ERROR('post')] };
    if (userId !== missingPost.userId)
      return { errors: [CREATE_NOT_AUTHORIZED_ERROR('user')] };

    const { description, privacy, type, title, showEmail, showPhoneNumber } =
      input;

    if (description) missingPost.description = description;
    if (privacy) missingPost.privacy = privacy;
    if (type) missingPost.type = type;
    if (title) missingPost.title = title;
    if (typeof showEmail === 'boolean') {
      missingPost.showEmail = showEmail;
    }
    if (typeof showPhoneNumber === 'boolean') {
      missingPost.showPhoneNumber = showPhoneNumber;
    }

    const success = await getConnection().transaction(async () => {
      return getRepository(MissingPost)
        .update(id, {
          description: missingPost.description,
          privacy: missingPost.privacy,
          type: missingPost.type,
          title: missingPost.title,
          showPhoneNumber: missingPost.showPhoneNumber,
          showEmail: missingPost.showEmail,
        })
        .then(() => true)
        .catch(() => false); // save the missing post to get the address
    });

    return success ? { missingPost } : { errors: [INTERNAL_SERVER_ERROR] };
  }
}

export default MissingPostResolver;
