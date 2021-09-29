import { Address } from './../entity/Address';
import DataLoader from 'dataloader';
import { Pet } from '../entity/PetEntities/Pet';
import { User } from '../entity/UserEntities/User';

/* 
data loader takes separate keys and return data for them without performing multiple sql queries
i.e keys = [1,2,3,4] // keys are ids
    data = [{},{},{},{}] // data is the result of a single sql query
*/
export const createUserLoader = () => {
  return new DataLoader<number, User>((userIds) => {
    return User.findByIds(userIds as number[]);
  });
};

export const createPetLoader = () => {
  return new DataLoader<number, Pet>((petIds) => {
    return Pet.findByIds(petIds as number[]);
  });
};

export const createAddressLoader = () => {
  return new DataLoader<number, Address>((addressIds) => {
    return Address.findByIds(addressIds as number[]);
  });
};
