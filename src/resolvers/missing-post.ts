import { NotificationType } from './../types/types';
import { NotificationRepo } from './../repos/NotificationRepo.repo';
import { Comment } from './../entity/InteractionsEntities/Comment';
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
import { MyContext } from '../types';
import {
  CreateCommentInputType,
  CreateMissingPostInput,
} from '../types/inputTypes';
import {
  CommentResponse,
  CreateMissingPostResponse,
} from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { createBaseResolver } from '../utils/createBaseResolver';
import { Address } from './../entity/Address';
import { PostUpdoot } from './../entity/InteractionsEntities/PostUpdoot';
import { Photo } from './../entity/MediaEntities/Photo';
import { PostImages } from './../entity/MediaEntities/PostImages';
import { MissingPost } from './../entity/PostEntities/MissingPost';
import { User } from './../entity/UserEntities/User';
import { PhotoRepo } from '../repos/PhotoRepo.repo';
import { UpdootRepo } from '../repos/UpdootRepo.repo';

const MissingPostBaseResolver = createBaseResolver('MissingPost', MissingPost);

@Resolver(MissingPost)
class MissingPostResolver extends MissingPostBaseResolver {
  constructor(
    private readonly photoRepo: PhotoRepo,
    private readonly updootRepo: UpdootRepo,
    private readonly notificationRepo: NotificationRepo
  ) {
    super();
  }

  @FieldResolver(() => User)
  user(
    @Root() { userId }: MissingPost,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User> {
    return userLoader.load(userId);
  }

  @Query(() => [MissingPost])
  async missingPosts(): Promise<MissingPost[]> {
    return MissingPost.find({ order: { createdAt: 'DESC' } });
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
        errors: [{ field: 'user', code: 404, message: 'User not found' }],
      };

    //1. Create the location
    const missingPost = MissingPost.create({
      title,
      description,
      type,
      privacy,
      user,
    });

    //todo: given the lng and lat, find the closest location if not provided
    //2. Create the address
    if (address) {
      const new_address = Address.create({
        ...address,
      });
      missingPost.address = new_address;
    }
    //3. Create the images
    const resolvedStreams = await this.photoRepo.getMultipleImagesStreams(
      images
    );
    const postImages = resolvedStreams.map(
      ({ filename, uniqueFileName }, idx) => {
        let isThumbnail = false;
        if (thumbnailIdx && thumbnailIdx === idx) {
          isThumbnail = true;
        }
        return PostImages.create({
          photo: Photo.create({
            filename,
            path: uniqueFileName,
            creator: user,
            isThumbnail,
          }),
        });
      }
    );
    //
    //4. Associate the thumbnail if exists
    if (typeof thumbnailIdx === 'number')
      missingPost.thumbnail = postImages[thumbnailIdx].photo;

    missingPost.images = postImages;

    //4. save the post and the images
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
        errors: [
          { code: 500, message: 'Internal Server Error', field: 'server' },
        ],
      };

    //TODO:  create notification to nearest 20 users that there is a missing pet

    return { post: missingPost };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    /* There is two cases to cover here
     *  1. User has not voted for this post before -> Create a new vote and increase/decrease the points by one (TRANSACTION)
     *  2. User has voted for this post
     *    * 2.1 User has changed his vote -> Update the current vote and increase/decrease the points by two (TRANSACTION)
     *    * 2.2 User has not changed his vote -> Do Nothing
     * */

    //check if value is only 1 or -1
    if (![-1, 1].includes(value)) return false;
    const isUpvote = value === 1;

    const { userId } = req.session;
    const post = await MissingPost.findOne(postId, { relations: ['user'] });
    if (!post) {
      return false;
    }
    const user = await User.findOne(userId);
    if (!user) {
      return false;
    }
    const updoot = await PostUpdoot.findOne({ where: { postId, userId } });

    let success = false;
    if (!updoot) {
      //1. User has not voted for this post before
      success = await this.updootRepo.createUpdoot({
        updootTarget: PostUpdoot,
        entity: post,
        user,
        value,
        type: 'post',
      });
    } else if (updoot.value !== value) {
      //2 User has voted for this post before and has changed his vote

      success = await this.updootRepo.updateUpdootValue({
        updoot,
        entity: post,
        value,
      });
    }

    if (success) {
      this.notificationRepo.createNotification(
        user,
        post,
        post.user,
        isUpvote ? NotificationType.UPVOTE : NotificationType.DOWNVOTE
      );
    }

    return success;
  }

  @Mutation(() => CommentResponse)
  @UseMiddleware(isAuth)
  async comment(
    @Arg('input') { postId, text, parentId }: CreateCommentInputType,
    @Ctx() { req }: MyContext
  ): Promise<CommentResponse> {
    const isReply = parentId != null;
    const userId = req.session.userId;
    const user = await User.findOne(userId);
    if (!user) {
      return {
        errors: [{ field: 'user', code: 404, message: 'User not found' }],
      };
    }

    const post = await MissingPost.findOne(postId);
    if (!post) {
      return {
        errors: [{ field: 'post', code: 404, message: 'Post not found' }],
      };
    }
    //Two cases to cover here
    // * 1. User is commenting on a post
    // * 2. User is replying to a comment

    let comment: Comment;

    if (!isReply) {
      //1. User is commenting on a post
      comment = Comment.create({
        text,
        user,
        post,
      });
    } else {
      //2. User is replying to a comment
      const parentComment = await Comment.findOne(parentId);
      if (!parentComment) {
        return {
          errors: [
            {
              field: 'comment',
              code: 404,
              message: 'Parent comment not found',
            },
          ],
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
            errors: [
              {
                field: 'comment',
                code: 404,
                message: 'Grandparent comment not found',
              },
            ],
          };
        }
        comment = Comment.create({
          text,
          user,
          post,
          parentId: grandParentComment.id,
        });
      } else {
        comment = Comment.create({
          text,
          user,
          post,
          parentId: parentComment.id,
        });
      }
    }
    await comment.save();
    return { comment };
  }
}

export default MissingPostResolver;
