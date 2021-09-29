import { Address } from './../entity/Address';
import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { MyContext } from '../types';
import { createImageMetaData } from '../utils/createImage';
import { PetImages } from './../entity/MediaEntities/PetImages';
import { Photo } from './../entity/MediaEntities/Photo';
import { Pet } from './../entity/PetEntities/Pet';
import { PetBreed } from './../entity/PetEntities/PetBreed';
import { AdoptionPost } from './../entity/PostEntities/AdoptionPost';
import { User } from './../entity/UserEntities/User';
import { isAuth } from './../middleware/isAuth';
import { CreatePetOptions, FieldError } from './../types/responseTypes';
import { Upload } from './../types/Upload';

@InputType()
class AdoptionPostInput {
  @Field(() => CreatePetOptions)
  petInfo: CreatePetOptions;
}

@ObjectType()
class AdoptionPostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => AdoptionPost)
  adoptionPost?: AdoptionPost;
}

@Resolver(AdoptionPost)
class AdoptionPostResolver {
  @FieldResolver()
  user(
    @Root() { userId }: AdoptionPost,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User | undefined> {
    return userLoader.load(userId);
  }

  @FieldResolver()
  pet(
    @Root() { petId }: AdoptionPost,
    @Ctx() { dataLoaders: { petLoader } }: MyContext
  ): Promise<Pet | undefined> {
    return petLoader.load(petId);
  }

  @FieldResolver({ nullable: true })
  async address(
    @Root() { addressId }: AdoptionPost,
    @Ctx() { dataLoaders: { addressLoader } }: MyContext
  ): Promise<Address | null> {
    if (!addressId) return null;
    return addressLoader.load(addressId);
  }

  @Query(() => [AdoptionPost])
  adoptionPosts(): Promise<AdoptionPost[]> {
    return AdoptionPost.find();
  }

  @Mutation(() => AdoptionPostResponse)
  @UseMiddleware(isAuth)
  async createAdoptionPost(
    @Arg('input') input: AdoptionPostInput,
    @Arg('images', () => [GraphQLUpload]) images: Upload[],
    @Ctx() { req }: MyContext
  ): Promise<AdoptionPostResponse> {
    const user = await User.findOne(req.session.userId);
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

    const { petInfo } = input;
    const { breeds } = petInfo;

    //0. Create an array of read streams
    const streams = images.map(async (image) => {
      const { createReadStream, filename } = await image; //IMPROVE: Duplication that needs to be improved later
      return {
        stream: createReadStream(),
        filename,
      };
    });

    const resolvedStreams = await Promise.all(streams);

    //1. create the pet
    const pet = Pet.create({
      ...petInfo,
      breeds: breeds.map((breed) => PetBreed.create({ breed })),
      user,
    });

    //2. create pet images

    const petImages = resolvedStreams.map((image) => {
      const { uniqueFileName } = createImageMetaData(image.filename);
      return PetImages.create({
        photo: Photo.create({
          filename: image.filename,
          path: uniqueFileName,
          creator: user,
        }),
      });
    });

    //3. associate pet images to pet
    pet.images = petImages; //

    //4. create the adoption post
    const adoptionPost = AdoptionPost.create({
      pet,
      user,
    });

    //5. create address and associate to post
    const address = Address.create({
      city: 'Tanta',
      country: 'Egypt',
      state: 'Algharbiya',
      lat: 30.808779,
      lng: 30.990599,
      zip: '31111',
      street: 'El Bahr',
    });
    //30.806401, 30.989634 // 30.808779, 30.990599

    adoptionPost.address = address;

    const success = await getConnection().transaction(
      async (_transactionalEntityManager) => {
        //I want to save only the adoption post and everything related to it will be saved in cascade
        // (pet and its images will be saved automatically)
        //first, save the post
        await adoptionPost.save();

        //then write images in parallel to disk
        await Promise.all(
          resolvedStreams.map((s) => {
            const { stream, filename } = s;
            const { pathName } = createImageMetaData(filename);

            return stream.pipe(createWriteStream(pathName));
          })
        );
        return true;
      }
    );

    if (!success)
      return {
        errors: [
          { code: 500, message: 'Internal Server Error', field: 'server' },
        ],
      };
    return { adoptionPost };
  }
}

export default AdoptionPostResolver;
