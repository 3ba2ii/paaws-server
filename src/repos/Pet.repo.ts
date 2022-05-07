import { Service } from 'typedi';
import { EntityRepository, getConnection, Repository } from 'typeorm';
import { Pet } from '../entity/PetEntities/Pet';
import { PetImages } from './../entity/MediaEntities/PetImages';
import { Photo } from './../entity/MediaEntities/Photo';
import { OwnedPet } from './../entity/PetEntities/OwnedPet';
import { PetBreed } from './../entity/PetEntities/PetBreed';
import { PetColor } from './../entity/PetEntities/PetColors';
import { PetSkill } from './../entity/PetEntities/PetSkill';
import { User } from './../entity/UserEntities/User';
import { CREATE_INVALID_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
import { Breeds, PetColors } from './../types/enums.types';
import { CreatePetInput } from './../types/input.types';
import {
  CreateUserOwnedPetResponse,
  FieldError,
} from './../types/response.types';
import { Upload } from './../types/Upload';
import { PhotoRepo } from './PhotoRepo.repo';

interface ICreatePet {
  pet?: Pet | null;
  errors?: FieldError[];
}
@Service()
@EntityRepository(Pet)
export class PetRepo extends Repository<Pet> {
  constructor(private readonly photoRepo: PhotoRepo) {
    super();
  }
  updatePetBreeds(breeds: Breeds[], pet: Pet): PetBreed[] {
    const newBreeds: PetBreed[] = [];
    breeds.forEach((breed) => {
      const existingBreed = pet.breeds.find((pBreed) => pBreed.breed === breed);

      //if not existing breed, create a new one
      if (!existingBreed) {
        newBreeds.push(PetBreed.create({ breed }));
      } else {
        //if existing breed, add it to the newBreeds array
        newBreeds.push(existingBreed);
      }
    });
    return newBreeds;
  }
  /*  
  async updatePetInfo(
    {
      name,
      about,
      birthDate,
      breeds,
      gender,
      size,
      spayedOrNeutered,
      type,
      vaccinated,
    }: AdoptionPostUpdateInput,
    id: number
  ): Promise<PetResponse> {
    try {
      const pet = await Pet.findOne(id);
      if (!pet) return { errors: [CREATE_NOT_FOUND_ERROR('pet')] };

      if (name) pet.name = name;
      if (birthDate) pet.birthDate = birthDate;
      if (gender) pet.gender = gender;
      if (size) pet.size = size;
      if (type) pet.type = type;
      if (breeds) pet.breeds = this.updatePetBreeds(breeds, pet);

      if (typeof vaccinated === 'boolean') pet.vaccinated = vaccinated;
      if (typeof spayedOrNeutered === 'boolean')
        pet.spayedOrNeutered = spayedOrNeutered;
      if (about) pet.about = about;

      await pet.save();

      return {
        pet,
      };
    } catch (e) {
      console.error(e);
      return {
        errors: [INTERNAL_SERVER_ERROR],
      };
    }
  } */

  createBreeds(breeds: Breeds[], pet: Pet): PetBreed[] {
    return [...new Set(breeds)].map((breed) =>
      PetBreed.create({ breed, petId: pet.id })
    );
  }

  createColors(colors: PetColors[], pet: Pet): PetColor[] {
    return [...new Set(colors)].map((color) =>
      PetColor.create({ color, petId: pet.id })
    );
  }

  createSkills(skills: string[], pet: Pet): PetSkill[] {
    return [...new Set(skills)].map((skill) =>
      PetSkill.create({ skill, petId: pet.id })
    );
  }

  async createPet(
    user: User,
    { thumbnailIdx, breeds, colors, skills, ...petInfo }: CreatePetInput,
    images: Upload[]
  ): Promise<ICreatePet> {
    try {
      const pet = Pet.create({ ...petInfo });

      //attach the breeds
      pet.breeds = this.createBreeds(breeds, pet);

      //attach the breeds
      pet.colors = this.createColors(colors, pet);

      //attach the skills
      pet.skills = this.createSkills(skills, pet);

      //attach images
      if (images && images.length > 5) {
        return {
          errors: [
            CREATE_INVALID_ERROR('images', 'You can only upload 5 images'),
          ],
        };
      }
      let resolvedPhotos: Photo[] = [];
      await Promise.all(
        images.map(async (image) => {
          const { photo, errors } = await this.photoRepo.createPhoto(
            image,
            user.id
          );
          if (!errors?.length && photo) resolvedPhotos.push(photo);
        })
      );
      const petImages = resolvedPhotos.map((photo) =>
        PetImages.create({ photo, petId: pet.id })
      );

      pet.images = petImages;

      if (typeof thumbnailIdx === 'number' && resolvedPhotos.length) {
        pet.thumbnail =
          resolvedPhotos[Math.max(thumbnailIdx, resolvedPhotos.length - 1)];
      }

      return { pet };
    } catch (e) {
      return { errors: [INTERNAL_SERVER_ERROR, e] };
    }
  }
  //create user's owned pet method
  async createUserOwnedPet(
    user: User,
    petInfo: CreatePetInput,
    images: Upload[]
  ): Promise<CreateUserOwnedPetResponse> {
    try {
      const { pet, errors } = await this.createPet(user, petInfo, images);
      if (errors && errors.length) return { errors };
      if (!pet)
        return {
          errors: [
            CREATE_INVALID_ERROR(
              'pet',
              'Could not create the pet at the mean time'
            ),
          ],
        };

      const userOwnedPet = OwnedPet.create({
        user,
        pet,
        about: petInfo.about,
      });

      //update user's pets count
      user.petsCount += 1;

      const success = await getConnection().transaction(async () => {
        await userOwnedPet.save().catch(() => false);
        await user.save().catch(() => false);
        return true;
      });
      return success
        ? { ownedPet: userOwnedPet }
        : {
            errors: [
              CREATE_INVALID_ERROR(
                'pet',
                'Could not create the pet at the mean time'
              ),
            ],
          };
    } catch (e) {
      return { errors: [INTERNAL_SERVER_ERROR, e] };
    }
  }

  //delete user's owned pet method
  async deleteUserOwnedPet(user: User, petId: number): Promise<boolean> {
    //1. find the pet
    const pet = await Pet.findOne(petId);
    if (!pet) return false;
    //2. find the user's owned pet
    const userOwnedPet = await OwnedPet.findOne({ petId, userId: user.id });
    if (!userOwnedPet) return false;
    //update pet count
    user.petsCount -= 1;
    const success = await getConnection().transaction(async () => {
      //remove and persist
      await pet.remove().catch(() => false);
      await user.save().catch(() => false);
      return true;
    });
    return success;
  }
}
