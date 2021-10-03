import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import {
  createUserLoader,
  createPetLoader,
  createAddressLoader,
  createImagesLoader,
} from './utils/dataLoaders';

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  dataLoaders: {
    petLoader: ReturnType<typeof createPetLoader>;
    userLoader: ReturnType<typeof createUserLoader>;
    addressLoader: ReturnType<typeof createAddressLoader>;
    petImagesLoader: ReturnType<typeof createImagesLoader>;
  };
};
