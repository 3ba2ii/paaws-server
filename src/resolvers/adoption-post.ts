import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Address } from '../entity/Address';
import { Pet } from '../entity/PetEntities/Pet';
import { AdoptionPost } from '../entity/PostEntities/AdoptionPost';
import { User } from '../entity/UserEntities/User';
import { MyContext } from '../types';
import { AdoptionPetsFilters } from '../types/input.types';
import { PaginatedAdoptionPosts } from '../types/response.types';
import { createBaseResolver } from '../utils/createBaseResolver';

const AdoptionPostBaseResolver = createBaseResolver(
  'AdoptionPost',
  AdoptionPost
);

@Resolver(AdoptionPost)
class AdoptionPostResolver extends AdoptionPostBaseResolver {
  constructor() {
    super();
  }

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
  /* @Mutation(() => AdoptionPostResponse)
  @UseMiddleware(isAuth)
  async createAdoptionPost(
    @Arg('input') input: AdoptionPostInput,
    @Arg('images', () => [GraphQLUpload]) images: Upload[],
    @Ctx() { req }: MyContext
  ): Promise<AdoptionPostResponse> {
    const userId = req.session.userId;
    const user = await User.findOne(userId);
    if (!userId || !user)
      return {
        errors: [CREATE_NOT_FOUND_ERROR('user')],
      };

    const { petInfo, address: inputAddress } = input;
    const { breeds, thumbnailIdx } = petInfo;

    //0. Create an array of read streams

    //1. create the pet
    const pet = Pet.create({
      ...petInfo,
      breeds: breeds.map((breed) => PetBreed.create({ breed })),
      user,
    });

    //2. create pet images
    const resolvedPhotos: Photo[] = [];
    images.forEach(async (image) => {
      const { photo, errors } = await this.photoRepo.createPhoto(image, userId);
      if (!errors?.length && photo) resolvedPhotos.push(photo);
    });

    const petImages = resolvedPhotos.map((photo) => {
      return PetImages.create({ photo, petId: pet.id });
    });

    //3. associate pet images to pet
    pet.images = petImages;

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

    const success = await getConnection().transaction(async (_) => {
      return adoptionPost
        .save()
        .then(() => true)
        .catch(() => false);
    });

    if (!success)
      return {
        errors: [INTERNAL_SERVER_ERROR],
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
    const post = await AdoptionPost.findOne(id);

    if (!post)
      return {
        errors: [CREATE_NOT_FOUND_ERROR('post')],
      };

    if (post.userId !== req.session.userId)
      return {
        errors: [CREATE_NOT_AUTHORIZED_ERROR('user')],
      };

    const { errors } = await this.petRepo.updatePetInfo(newPetInfo, post.petId);
    if (errors?.length)
      return {
        errors,
      };

    return {
      adoptionPost: post,
    };
  } */
}

export default AdoptionPostResolver;
