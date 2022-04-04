import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { PetImages } from '../entity/MediaEntities/PetImages';
import { Pet } from '../entity/PetEntities/Pet';
import { MyContext } from '../types';
import { createBaseResolver } from '../utils/createBaseResolver';

const PetBaseResolver = createBaseResolver('Pet', Pet);
@Resolver(Pet)
class PetResolver extends PetBaseResolver {
  /*  @FieldResolver({ nullable: true })
  async thumbnail(@Root() { thumbnailId }: Pet): Promise<Photo | undefined> {
    if (!thumbnailId) return undefined;
    return Photo.findOne(thumbnailId);
  } */

  @FieldResolver({ nullable: true })
  images(
    @Root() pet: Pet,
    @Ctx() { dataLoaders: { petImagesLoader } }: MyContext
  ): Promise<PetImages[] | undefined> {
    return petImagesLoader.load(pet.id);
  }

  /*  @FieldResolver()
  user(
    @Root() pet: Pet,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User | undefined> {
    return userLoader.load(pet.userId);
  } */

  @Query(() => [Pet])
  async pets(): Promise<Pet[]> {
    return Pet.find();
  }
  @Query(() => Pet, { nullable: true })
  async pet(@Arg('petId', () => Int) petId: number): Promise<Pet | undefined> {
    return Pet.findOne(petId);
  }

  /*  @Mutation(() => PetResponse)
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

    return { pet };
  } */
}

export default PetResolver;
