import DataLoader from 'dataloader';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';
import { Address } from './../entity/Address';
import { PetImages } from './../entity/MediaEntities/PetImages';
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
//we need to make a method that creates a data loader for an entity that returns multiples results for a single id
