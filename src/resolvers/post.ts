import { Address } from './../entity/Address';
import { createWriteStream } from 'fs';
import { GraphQLUpload } from 'graphql-upload';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
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
import { PetType, PetGender, PetSize, Breeds } from '../types/types';

@InputType()
class AdoptionPostInput {
  @Field(() => CreatePetOptions)
  petInfo: CreatePetOptions;
}

@ObjectType()
class AdoptionPostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => AdoptionPost, { nullable: true })
  adoptionPost?: AdoptionPost;
}

@ObjectType()
class PaginatedAdoptionPosts {
  @Field(() => [AdoptionPost])
  posts: AdoptionPost[];

  @Field()
  hasMore: boolean;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}
@InputType()
class AdoptionPostUpdateInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => PetType, { nullable: true })
  type?: PetType;

  @Field(() => PetGender, { nullable: true })
  gender?: PetGender;

  @Field(() => PetSize, { nullable: true })
  size?: PetSize;

  @Field(() => Date, { nullable: true })
  birthDate?: Date;

  @Field(() => Boolean, { nullable: true })
  vaccinated?: Boolean;

  @Field(() => Boolean, { nullable: true })
  spayed?: Boolean;

  @Field(() => Boolean, { nullable: true })
  neutered?: Boolean;

  @Field({ nullable: true })
  about?: string;

  @Field(() => [Breeds], { nullable: true })
  breeds?: Breeds[];
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

  @Query(() => PaginatedAdoptionPosts)
  async adoptionPosts(
    @Arg('limit', () => Int, { nullable: true, defaultValue: 20 })
    limit: number,
    @Arg('cursor', { nullable: true }) cursor: string
  ): Promise<PaginatedAdoptionPosts> {
    const realLimit = Math.min(20, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) replacements.push(new Date(cursor));

    const posts = await getConnection().query(
      `
        select * from adoption_post
        ${cursor ? `where "createdAt" < $2` : ''}
        order by "createdAt" DESC
        limit $1;
      `,
      replacements
    );

    return {
      hasMore: posts.length === realLimitPlusOne,
      posts: posts.slice(0, realLimit),
    };
  }

  @Query(() => AdoptionPost, { nullable: true })
  adoptionPost(
    @Arg('id', () => Int) id: number
  ): Promise<AdoptionPost | undefined> {
    return AdoptionPost.findOne(id);
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
    //preferred location to the user
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

    // create notification to nearest users 20 that there is a new pet to adopt in their area
    return { adoptionPost };
  }

  @Mutation(() => AdoptionPostResponse)
  @UseMiddleware(isAuth)
  async updateAdoptionPost(
    @Arg('id', () => Int) id: number,
    @Arg('newPetInfo', () => AdoptionPostUpdateInput)
    newPetInfo: AdoptionPostUpdateInput,
    @Ctx() { req }: MyContext
  ): Promise<AdoptionPostResponse> {
    const post = await AdoptionPost.findOne(id, { relations: ['pet'] });

    if (!post) {
      return {
        errors: [{ field: 'post', code: 404, message: 'Post not found' }],
      };
    }

    if (post.userId !== req.session.userId) {
      //Not post owner
      return {
        errors: [
          {
            field: 'post',
            code: 401,
            message: 'Not authorized',
          },
        ],
      };
    }
    const {
      name,
      birthDate,
      gender,
      size,
      breeds,
      vaccinated,
      spayed,
      neutered,
      about,
      type,
    } = newPetInfo;
    const { pet } = post;
    console.log(
      `🚀 ~ file: post.ts ~ line 306 ~ AdoptionPostResolver ~ pet`,
      pet.breeds[0]
    );

    if (name) pet.name = name;
    if (birthDate) pet.birthDate = birthDate;
    if (gender) pet.gender = gender;
    if (size) pet.size = size;
    if (type) pet.type = type;
    if (breeds) {
      //check if the breed already exists on the pet -> no need to create a new one
      const newBreeds: PetBreed[] = [];
      breeds.forEach((breed) => {
        const existingBreed = pet.breeds.find(
          (pBreed) => pBreed.breed === breed
        );

        //if not existing breed, create a new one
        if (!existingBreed) {
          newBreeds.push(PetBreed.create({ breed }));
        } else {
          //if existing breed, add it to the newBreeds array
          newBreeds.push(existingBreed);
        }
      });

      pet.breeds = newBreeds;
    }

    if (typeof vaccinated === 'boolean') pet.vaccinated = vaccinated;
    if (typeof spayed === 'boolean') pet.spayed = spayed;
    if (typeof neutered === 'boolean') pet.neutered = neutered;
    if (about) pet.about = about;

    //5. Save pet
    try {
      await pet.save();
    } catch (e) {
      return {
        errors: [
          {
            field: 'pet',
            code: 500,
            message: 'Internal Server Error',
          },
        ],
      };
    }

    return {
      adoptionPost: post,
    };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteAdoptionPost(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const post = await AdoptionPost.findOne(id, {
      relations: ['pet', 'address'],
    });

    if (!post) {
      return false;
    }

    if (post.userId !== req.session.userId) {
      //Not post owner
      return false;
    }

    try {
      await getConnection().transaction(async (_transactionalEntityManager) => {
        //1. Delete the post
        await post.remove();
        //2. Delete the pet and its images, breeds
        await post.pet.remove();
        //3. Delete the address associated with it
        await post.address.remove();

        return true;
      });
    } catch (e) {
      console.log('ERROR while removing a post', e);
      return false;
    }
    return true;
  }
}

export default AdoptionPostResolver;
