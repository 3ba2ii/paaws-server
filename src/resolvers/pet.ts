import { UserFavorites } from '../entity/UserFavorites';
import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { MyContext } from '../types';
import { CreatePetOptions, PetResponse } from '../types/responseTypes';
import { Pet } from './../entity/Pet';
import { PetBreed } from './../entity/PetBreed';
import { User } from './../entity/User';
import { isAuth } from './../middleware/isAuth';
import { RegularResponse } from './../types/responseTypes';

@Resolver(Pet)
class PetResolver {
  @Query(() => [Pet])
  @UseMiddleware(isAuth)
  async pets(): Promise<Pet[]> {
    return Pet.find({
      relations: ['breeds', 'user', 'likes'],
    });
  }
  @Query(() => Pet, {
    nullable: true,
  })
  @UseMiddleware(isAuth)
  async pet(@Arg('petId', () => Int) petId: number): Promise<Pet | undefined> {
    return Pet.findOne(petId, {
      relations: ['breeds', 'user', 'likes'],
    });
  }

  @Mutation(() => PetResponse)
  @UseMiddleware(isAuth)
  async createPet(
    @Arg('createPetOptions') createPetOptions: CreatePetOptions,
    @Ctx() { req }: MyContext
  ): Promise<PetResponse> {
    const { breeds } = createPetOptions;

    const userId = req.session.userId;
    const user = await User.findOne(userId);

    const pet = Pet.create({
      ...createPetOptions,
      breeds: breeds.map((breed) => PetBreed.create({ breed })),
      user,
    });
    await pet.save();

    return {
      pet,
    };
  }

  @Mutation(() => RegularResponse)
  @UseMiddleware(isAuth)
  async deletePet(
    @Arg('petId', () => Int) petId: number,
    @Ctx() { req }: MyContext
  ): Promise<RegularResponse> {
    const userId = req.session.userId;
    const pet = await Pet.findOne(petId);
    console.log(`🚀 ~ file: pet.ts ~ line 64 ~ PetResolver ~ pet`, pet);
    if (!pet)
      return {
        errors: [
          {
            code: 404,
            message: 'Pet not found',
            field: 'pet',
          },
        ],
        success: false,
      };
    if (pet.userId !== userId) {
      return {
        errors: [
          {
            code: 403,
            message: 'You are not allowed to delete this pet',
            field: 'user',
          },
        ],
        success: false,
      };
    }

    await Pet.delete(petId);

    return { success: true };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async likePet(
    @Arg('petId', () => Int) petId: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const pet = await Pet.findOne({ id: petId });
    if (!pet) return false;

    const user = await User.findOne({ id: req.session.userId });

    const userFavorite = UserFavorites.create({ user, pet });

    pet.numberOfLikes += 1;

    try {
      const conn = getConnection();
      await conn.transaction(async (_transactionalEntityManager) => {
        await conn.manager.insert(UserFavorites, userFavorite);
        await pet.save();
      });

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

export default PetResolver;
