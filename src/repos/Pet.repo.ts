import { Pet } from '../entity/PetEntities/Pet';
import { Service } from 'typedi';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './../entity/UserEntities/User';
import { CreatePetInput } from './../types/input.types';
import { Upload } from './../types/Upload';

@Service()
@EntityRepository(Pet)
export class PetRepo extends Repository<Pet> {
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
  //create user's owned pet method
  async createUserOwnedPet(
    user: User,
    petInfo: CreatePetInput,
    images: Upload[]
  ) {
    //
  }
}
