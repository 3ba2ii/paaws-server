import DataLoader from 'dataloader';
import { User } from '../entity/UserEntities/User';

/* 
data loader takes separate keys and return data for them without performing multiple sql queries
i.e keys = [1,2,3,4] // keys are ids
    data = [{},{},{},{}] // data is the result of a single sql query
*/
export const createUserLoader = () => {
  return new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const petIdToPet: Record<number, User> = {};
    users.forEach((u) => {
      petIdToPet[u.id] = u;
    });
    return users;
  });
};
