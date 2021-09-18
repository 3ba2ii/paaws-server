import { MyContext } from '../types';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { Pet } from './../entity/Pet';
import { PetBreed } from './../entity/PetBreed';
import { User } from './../entity/User';
import { isAuth } from './../middleware/isAuth';
import { CreatePetOptions, PetResponse } from '../types/responseTypes';

@Resolver(Pet)
class PetResolver {
  /*  @FieldResolver(() => String)
  user(@Root() user: User, @Ctx() { req }: MyContext) {
    //this is the current user and its ok to show them their email
    if (req.session.userId === user.id) {
      return user.email;
    }

    //this is NOT the current user, so hide the email
    return '';
  }
 */
  @Query(() => [Pet])
  async pets(): Promise<Pet[]> {
    return await Pet.find({
      relations: ['breeds', 'user', 'likes'],
    });
  }

  @Query(() => [PetBreed])
  async breeds(): Promise<PetBreed[]> {
    return await PetBreed.find({ relations: ['pet'] });
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
}

export default PetResolver;
