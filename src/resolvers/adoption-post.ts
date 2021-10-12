import { AdoptionPostUpdateInput } from '../types/inputTypes';
import { createWriteStream } from 'fs';
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
import { MyContext } from '../types';
import { createImageMetaData } from '../utils/createImage';
import { Address } from '../entity/Address';
import { PetImages } from '../entity/MediaEntities/PetImages';
import { Photo } from '../entity/MediaEntities/Photo';
import { Pet } from '../entity/PetEntities/Pet';
import { PetBreed } from '../entity/PetEntities/PetBreed';
import { AdoptionPost } from '../entity/PostEntities/AdoptionPost';
import { User } from '../entity/UserEntities/User';
import { isAuth } from '../middleware/isAuth';
import {
  AdoptionPostResponse,
  PaginatedAdoptionPosts,
} from '../types/responseTypes';
import { Upload } from '../types/Upload';
import { AdoptionPetsFilters, AdoptionPostInput } from '../types/inputTypes';

@Resolver(AdoptionPost)
class AdoptionPostResolver {
  @FieldResolver(() => User)
  user(
    @Root() { userId }: AdoptionPost,
    @Ctx() { dataLoaders: { userLoader } }: MyContext
  ): Promise<User> {
    return userLoader.load(userId);
  }

  @FieldResolver(() => Pet)
  pet(
    @Root() { petId }: AdoptionPost,
    @Ctx() { dataLoaders: { petLoader } }: MyContext
  ): Promise<Pet | undefined> {
    return petLoader.load(petId);
  }

  @FieldResolver(() => Address, { nullable: true })
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
    @Arg('cursor', { nullable: true }) cursor: string,
    @Arg('filters', () => AdoptionPetsFilters, { nullable: true })
    filters: AdoptionPetsFilters
  ): Promise<PaginatedAdoptionPosts> {
    const realLimit = Math.min(20, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) replacements.push(new Date(cursor));

    //TODO: Add filters that will be used to filter the posts
    /**
     * 1. Filter by pet type [can be multiple] - DONE
     * 2. Filter by pet breed [can be multiple]
     * 3. Filter by age [can be multiple]
     * 4. Filter by gender
     * 5. Filter by size
     * 6. Filter by color
     */

    const { petGenders, petSizes, petTypes } = filters || {
      petGenders: [],
      petSizes: [],
      petTypes: [],
    };

    let posts = getConnection()
      .getRepository(AdoptionPost)
      .createQueryBuilder('ap')
      .leftJoinAndSelect(`ap.pet`, `pet`);

    if (cursor)
      posts.where('ap."createdAt" < :cursor', {
        cursor: new Date(cursor),
      });

    posts
      .andWhere((qb) => {
        const subQuery = qb.subQuery().select('pet.id').from(Pet, 'pet');

        if (petTypes?.length) {
          subQuery.where('pet.type IN (:...petTypes)', {
            petTypes,
          });
        }
        if (petGenders?.length) {
          subQuery.andWhere('pet.gender IN (:...petGenders)', {
            petGenders,
          });
        }
        if (petSizes?.length) {
          subQuery.andWhere('pet.size IN (:...petSizes)', {
            petSizes,
          });
        }
        return `ap.petId IN (${subQuery.getQuery()})`;
      })
      .orderBy('ap."createdAt"', 'DESC')
      .limit(realLimitPlusOne);

    const adoptionPosts = await posts.getMany();

    return {
      hasMore: adoptionPosts.length === realLimitPlusOne,
      posts: adoptionPosts.slice(0, realLimit),
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

    const { petInfo, address: inputAddress } = input;
    const { breeds, thumbnailIdx } = petInfo;

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

    const petImages = resolvedStreams.map((image, idx) => {
      let isThumbnail = false;
      if (thumbnailIdx && thumbnailIdx === idx) {
        isThumbnail = true;
      }
      const { uniqueFileName } = createImageMetaData(image.filename);
      return PetImages.create({
        photo: Photo.create({
          filename: image.filename,
          path: uniqueFileName,
          creator: user,
          isThumbnail,
        }),
      });
    });

    //3. associate pet images to pet
    pet.images = petImages; //

    console.log(
      `🚀 ~ file: post.ts ~ line 202 ~ AdoptionPostResolver ~ thumbnailIdx`,
      thumbnailIdx
    );
    //4. Associate the thumbnail if exists
    if (typeof thumbnailIdx === 'number')
      pet.thumbnail = petImages[thumbnailIdx].photo;

    //5. create the adoption post
    const adoptionPost = AdoptionPost.create({
      pet,
      user,
    });

    //6. create address and associate to post
    //preferred location to the user
    if (inputAddress) {
      const address = Address.create({
        ...inputAddress,
      });
      adoptionPost.address = address;
    }

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

    //TODO:  create notification to nearest 20 users that there is a new pet to adopt in their area
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
      spayedOrNeutered,
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
    if (typeof spayedOrNeutered === 'boolean')
      pet.spayedOrNeutered = spayedOrNeutered;
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
