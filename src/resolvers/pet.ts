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
import { PetImages } from '../entity/MediaEntities/PetImages';
import { Pet } from '../entity/PetEntities/Pet';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import { CreateUserOwnedPetResponse } from '../types/response.types';
import { User } from './../entity/UserEntities/User';
import { CREATE_NOT_FOUND_ERROR } from './../errors';
import { PetRepo } from './../repos/Pet.repo';
import { CreatePetInput } from './../types/input.types';
import { Upload } from './../types/Upload';

@Resolver(Pet)
class PetResolver {
  constructor(private readonly petRepo: PetRepo) {}

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
