import { CommentUpdoot } from './../entity/InteractionsEntities/CommentUpdoots';
import DataLoader from 'dataloader';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';
import { Address } from './../entity/Address';
import { PostUpdoot } from './../entity/InteractionsEntities/PostUpdoot';
import { PetImages } from './../entity/MediaEntities/PetImages';
import { Photo } from './../entity/MediaEntities/Photo';
import { PostImages } from './../entity/MediaEntities/PostImages';
import { createOneToManyLoader, loadMappedData } from './loadMappedData';

/* 
data loader takes separate keys and return data for them without performing multiple sql queries
i.e keys = [1,2,3,4] // keys are ids
    data = [{},{},{},{}] // data is the result of a single sql query
*/
export const createUserLoader = () => {
  return new DataLoader<number, User>((userIds) => {
    return loadMappedData(User, userIds as number[]);
  });
};

export const createPetLoader = () => {
  return new DataLoader<number, Pet>(async (petIds) => {
    return loadMappedData(Pet, petIds as number[]);
  });
};

export const createAddressLoader = () => {
  return new DataLoader<number, Address>(async (addressIds) => {
    return loadMappedData(Address, addressIds as number[]);
  });
};
export const createPhotoLoader = () => {
  return new DataLoader<number, Photo>(async (photoIds) => {
    return loadMappedData(Photo, photoIds as number[]);
  });
};

export const createVoteStatusLoader = () => {
  return new DataLoader<{ postId: number; userId: number }, PostUpdoot | null>(
    async (keys) => {
      const updoots = await PostUpdoot.findByIds(keys as any);
      const updootIdsToUsers: Record<string, PostUpdoot> = {};
      updoots.forEach((updoot) => {
        updootIdsToUsers[`${updoot.userId}|${updoot.postId}`] = updoot;
      });
      return keys.map((key) => updootIdsToUsers[`${key.userId}|${key.postId}`]);
    }
  );
};

export const createCommentVoteStatusLoader = () => {
  return new DataLoader<
    { commentId: number; userId: number },
    CommentUpdoot | null
  >(async (keys) => {
    const updoots = await CommentUpdoot.findByIds(keys as any);

    const updootIdsToUsers: Record<string, CommentUpdoot> = {};
    updoots.forEach((updoot) => {
      updootIdsToUsers[`${updoot.userId}|${updoot.commentId}`] = updoot;
    });
    return keys.map(
      (key) => updootIdsToUsers[`${key.userId}|${key.commentId}`]
    );
  });
};

/* One to Many Loaders */
export const createPetImagesLoader = () => {
  return new DataLoader<number, PetImages[]>(async (petIds) => {
    const data = await createOneToManyLoader(
      PetImages,
      petIds as number[],
      'petId'
    );
    return data;
  });
};
export const createPostImageLoader = () => {
  return new DataLoader<number, PostImages[]>(async (postIds) => {
    const data = await createOneToManyLoader(
      PostImages,
      postIds as number[],
      'postId'
    );
    return data;
  });
};
