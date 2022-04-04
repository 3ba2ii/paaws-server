import { PetImages } from './../entity/MediaEntities/PetImages';
import { Photo } from './../entity/MediaEntities/Photo';
import { CREATE_INVALID_ERROR, INTERNAL_SERVER_ERROR } from './../errors';
import { PetColor } from './../entity/PetEntities/PetColors';
import { Breeds, PetColors } from './../types/enums.types';
import { PetBreed } from './../entity/PetEntities/PetBreed';
import { Pet } from '../entity/PetEntities/Pet';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './../entity/UserEntities/User';
import { CreatePetInput } from './../types/input.types';
import { Upload } from './../types/Upload';
import { FieldError } from './../types/response.types';
import { PhotoRepo } from './PhotoRepo.repo';

@Service()
@EntityRepository(Pet)
export class PetRepo extends Repository<Pet> {
  constructor(private readonly photoRepo: PhotoRepo) {
    super();
  }
  /*  private updatePetBreeds(breeds: Breeds[], pet: Pet) {
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
    return breeds.map((breed) => PetBreed.create({ breed, pet }));
  }

  createColors(colors: PetColors[], pet: Pet): PetColor[] {
    return colors.map((color) => PetColor.create({ color, pet }));
  }

  async createPet(
    user: User,
    { thumbnailIdx, breeds, colors, ...petInfo }: CreatePetInput,
    images: Upload[]
  ): Promise<{ pet?: Pet | null; errors?: FieldError[] }> {
    try {
      const pet = Pet.create({ ...petInfo });

      //attach the breeds
      pet.breeds = this.createBreeds(breeds, pet);

      //attach the breeds
      pet.colors = this.createColors(colors, pet);

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
      const petImages = resolvedPhotos.map((photo) => {
        return PetImages.create({ photo, pet });
      });
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
  ) {
    //
  }
}
