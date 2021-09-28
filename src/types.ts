import { createPetLoader } from './utils/createPetLoader';
import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export type MyContext = {
  req: Request;
  res: Response;
  redis: Redis;
  petLoader: ReturnType<typeof createPetLoader>;
};
