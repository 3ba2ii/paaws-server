import { PetRepo } from './../repos/Pet.repo';
import { CREATE_NOT_FOUND_ERROR } from './../errors';
import { User } from './../entity/UserEntities/User';
import { Upload } from './../types/Upload';
import { CreatePetInput } from './../types/input.types';
import { isAuth } from 'src/middleware/isAuth';
import { CreateUserOwnedPetResponse } from 'src/types/response.types';
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
import { PetImages } from '../entity/MediaEntities/PetImages';
import { Pet } from '../entity/PetEntities/Pet';
import { MyContext } from '../types';
import { createBaseResolver } from '../utils/createBaseResolver';

const PetBaseResolver = createBaseResolver('Pet', Pet);
@Resolver(Pet)
class PetResolver extends PetBaseResolver {
  constructor(private readonly petRepo: PetRepo) {
    super();
  }

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

  @Mutation(() => CreateUserOwnedPetResponse)
  @UseMiddleware(isAuth)
  async createUserOwnedPet(
    @Arg('petInfo') petInfo: CreatePetInput,
    @Arg('images') images: Upload[],
    @Ctx() { req }: MyContext
  ): Promise<CreateUserOwnedPetResponse> {
    const user = await User.findOne(req.session.userId);
    if (!user) return { errors: [CREATE_NOT_FOUND_ERROR('user')] };

    return this.petRepo.createUserOwnedPet(user, petInfo, images);
  }
}

export default PetResolver;
