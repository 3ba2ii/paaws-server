import { PetSkill } from './../entity/PetEntities/PetSkill';
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
import { Pet } from '../entity/PetEntities/Pet';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { CreateUserOwnedPetResponse } from '../types/response.types';
import { OwnedPet } from './../entity/PetEntities/OwnedPet';
import { User } from './../entity/UserEntities/User';
import { CREATE_NOT_FOUND_ERROR } from './../errors';
import { PetRepo } from './../repos/Pet.repo';
import { CreatePetInput, PaginationArgs } from './../types/input.types';
import { PaginatedUserOwnedPetsResponse } from './../types/response.types';
import { Upload } from './../types/Upload';

@Resolver(OwnedPet)
class PetResolver {
  constructor(private readonly petRepo: PetRepo) {}

  /*  @FieldResolver(() => [PetImages], { nullable: true })
  images(
    @Root() pet: Pet,
    @Ctx() { dataLoaders: { petImagesLoader } }: MyContext
  ): Promise<PetImages[] | undefined> {
    return petImagesLoader.load(pet.id);
  } */

  @FieldResolver(() => User)
  user(
    @Root() pet: OwnedPet,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User | undefined> {
    return userLoader.load(pet.userId);
  }

  @FieldResolver(() => Pet)
  pet(
    @Root() pet: OwnedPet,
    @Ctx() { dataLoaders: { petLoader } }: MyContext
  ): Promise<Pet | undefined> {
    return petLoader.load(pet.petId);
  }

  @FieldResolver(() => [PetSkill])
  skills(
    @Root() pet: OwnedPet,
    @Ctx() { dataLoaders: { petSkillsLoader } }: MyContext
  ): Promise<PetSkill[]> {
    return petSkillsLoader.load(pet.petId);
  }

  @Query(() => OwnedPet, { nullable: true })
  async userOwnedPet(
    @Arg('id', () => Int) id: number
  ): Promise<OwnedPet | undefined> {
    return OwnedPet.findOne(id);
  }
  @Query(() => PaginatedUserOwnedPetsResponse)
  async userOwnedPets(
    @Arg('userId') userId: number,
    @Arg('paginationArgs') { limit, cursor }: PaginationArgs
  ): Promise<PaginatedUserOwnedPetsResponse> {
    const realLimit = Math.min(limit || 5, 20);
    const realLimitPlusOne = realLimit + 1;

    const qb = getConnection().getRepository(OwnedPet).createQueryBuilder('op');

    //add where condition to find the pets that belongs to the user
    qb.andWhere(`op."userId" = :userId`, { userId });

    //add where condition for cursor
    if (cursor) {
      qb.andWhere(`op."createdAt" < :cursor`, {
        cursor: new Date(cursor) || null,
      });
    }

    const ownedPets = await qb
      .orderBy('op."createdAt"', 'DESC')
      .limit(realLimitPlusOne)
      .getMany();

    return {
      ownedPets: ownedPets.slice(0, realLimit),
      hasMore: ownedPets.length === realLimitPlusOne,
    };
  }

  @Mutation(() => CreateUserOwnedPetResponse)
  @UseMiddleware(isAuth)
  async createUserOwnedPet(
    @Arg('petInfo') petInfo: CreatePetInput,
    @Arg('images', () => [GraphQLUpload]) images: Upload[],
    @Ctx() { req }: MyContext
  ): Promise<CreateUserOwnedPetResponse> {
    const user = await User.findOne(req.session.userId);
    if (!user) return { errors: [CREATE_NOT_FOUND_ERROR('user')] };

    return this.petRepo.createUserOwnedPet(user, petInfo, images);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUserOwnedPet(
    @Arg('petId') petId: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne(req.session.userId);
    if (!user) return false;

    return this.petRepo.deleteUserOwnedPet(user, petId);
  }
}

export default PetResolver;
