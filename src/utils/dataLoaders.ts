import DataLoader from 'dataloader';
import { In } from 'typeorm';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';
import { Address } from './../entity/Address';
import { PetImages } from './../entity/MediaEntities/PetImages';
import { loadMappedData } from './loadMappedData';

/* 
data loader takes separate keys and return data for them without performing multiple sql queries
i.e keys = [1,2,3,4] // keys are ids
    data = [{},{},{},{}] // data is the result of a single sql query
*/
export const createUserLoader = () => {
  return new DataLoader<number, User>((userIds) => {
    return loadMappedData(User, userIds as number[]);
  });
};

export const createPetLoader = () => {
  return new DataLoader<number, Pet>(async (petIds) => {
    return loadMappedData(Pet, petIds as number[]);
  });
};

export const createAddressLoader = () => {
  return new DataLoader<number, Address>(async (addressIds) => {
    return loadMappedData(Address, addressIds as number[]);
  });
};

export const createImagesLoader = () => {
  return new DataLoader<number, PetImages[]>(async (petIds) => {
    //now we want to get all the pet images for the given pet ids
    const data = await PetImages.find({
      where: {
        petId: In(petIds as number[]),
      },
    });

    //we must map the input ids (petIds) to the output data (data) and group by petId
    // {2: [{info}]}
    let petImages: Record<number, PetImages[]> = {};
    data.forEach((petImage) => {
      if (!petImages[petImage.petId]) {
        petImages[petImage.petId] = [];
      }
      petImages[petImage.petId].push(petImage);
    });

    return petIds.map((petId) => petImages[petId]);
  });
};
