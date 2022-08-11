import { User } from './../../entity/UserEntities/User';
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory, _connection: Connection): Promise<void> {
    console.log('hello');
    const users = await factory(User)().createMany(10);
    console.log(
      `🚀 ~ file: initialSeed.ts ~ line 8 ~ InitialDatabaseSeed ~ run ~ users`,
      users
    );
  }
}
