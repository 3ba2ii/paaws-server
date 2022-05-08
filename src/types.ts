import { Request, Response } from 'express';
import { Redis } from 'ioredis';
import {
  createAddressLoader,
  createCommentVoteStatusLoader,
  createPetImagesLoader,
  createPetLoader,
  createPetSkillsLoader,
  createPhotoLoader,
  createPostImageLoader,
  createUserLoader,
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
    petSkillsLoader: ReturnType<typeof createPetSkillsLoader>;
    postImagesLoader: ReturnType<typeof createPostImageLoader>;
    photoLoader: ReturnType<typeof createPhotoLoader>;
    votingLoader: ReturnType<typeof createVoteStatusLoader>;
    commentVoteStatusLoader: ReturnType<typeof createCommentVoteStatusLoader>;
  };
};
