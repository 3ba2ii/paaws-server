import { MyContext } from 'src/types';
import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Pet } from './../entity/Pet';
import { PetBreed } from './../entity/PetBreed';
import { User } from './../entity/User';
import { isAuth } from './../middleware/isAuth';
import { CreatePetOptions, PetResponse } from '../types/responseTypes';

@Resolver(Pet)
class PetResolver {
  @Query(() => [Pet])
  async pets(): Promise<Pet[]> {
    return await Pet.find();
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

    const tempBreeds = breeds.map((breed) => PetBreed.create({ breed }));

    const pet = Pet.create({
      ...createPetOptions,
      breeds: tempBreeds,
      user,
    });
    await pet.save();

    return {
      pet,
    };
  }
}

export default PetResolver;
