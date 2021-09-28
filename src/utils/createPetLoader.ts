import DataLoader from 'dataloader';
import { Pet } from '../entity/PetEntities/Pet';

/* 
data loader takes separate keys and return data for them without performing multiple sql queries
i.e keys = [1,2,3,4] // keys are ids
    data = [{},{},{},{}] // data is the result of a single sql query
*/
export const createPetLoader = () => {
  return new DataLoader<number, Pet>(async (petIds) => {
    const pets = await Pet.findByIds(petIds as number[]);
    const petIdToPet: Record<number, Pet> = {};
    pets.forEach((pet) => {
      petIdToPet[pet.id] = pet;
    });
    return pets;
  });
};
