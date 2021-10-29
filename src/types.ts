import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import {
  createUserLoader,
  createPetLoader,
  createAddressLoader,
  createPetImagesLoader,
  createPostImageLoader,
  createPhotoLoader,
  createVoteStatusLoader,
} from './utils/dataLoaders';

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  dataLoaders: {
    petLoader: ReturnType<typeof createPetLoader>;
    userLoader: ReturnType<typeof createUserLoader>;
    addressLoader: ReturnType<typeof createAddressLoader>;
    petImagesLoader: ReturnType<typeof createPetImagesLoader>;
    postImagesLoader: ReturnType<typeof createPostImageLoader>;
    photoLoader: ReturnType<typeof createPhotoLoader>;
    votingLoader: ReturnType<typeof createVoteStatusLoader>;
  };
};
