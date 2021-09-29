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
import { Pet } from '../entity/PetEntities/Pet';
import { PetBreed } from '../entity/PetEntities/PetBreed';
import { User } from '../entity/UserEntities/User';
import { MyContext } from '../types';
import { CreatePetOptions, PetResponse } from '../types/responseTypes';
import { isAuth } from './../middleware/isAuth';
import { RegularResponse } from './../types/responseTypes';

@Resolver(Pet)
class PetResolver {
  @FieldResolver()
  user(
    @Root() pet: Pet,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User | undefined> {
    return userLoader.load(pet.userId);
  }

  @Query(() => [Pet])
  async pets(): Promise<Pet[]> {
    return Pet.find();
  }
  @Query(() => Pet, { nullable: true })
  async pet(@Arg('petId', () => Int) petId: number): Promise<Pet | undefined> {
    return Pet.findOne(petId);
  }

  @Mutation(() => PetResponse)
  @UseMiddleware(isAuth)
  public async createPet(
    @Arg('createPetOptions') createPetOptions: CreatePetOptions,
    @Ctx() { req }: MyContext
  ): Promise<PetResponse> {
    const { breeds } = createPetOptions;

    const userId = req.session.userId;
    const user = await User.findOne(userId);

    if (!user)
      return {
        errors: [
          {
            field: 'user',
            code: 404,
            message: 'User not found',
          },
        ],
      };

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
}

export default PetResolver;

/* 



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

    /*     pet.numberOfLikes += 1;
     */
/* try {
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
*/
