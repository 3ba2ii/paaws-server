import { UserGender } from './../../../types/enums.types';
import { User } from './../../../entity/UserEntities/User';
import * as Faker from 'faker';
import { define } from 'typeorm-seeding';

define(User, (faker: typeof Faker) => {
  const user = new User();
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  user.full_name = `${firstName} ${lastName}`;
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.phone = faker.phone.phoneNumber();
  user.phoneVerified = faker.datatype.boolean();
  user.gender = faker.random.arrayElement([UserGender.MALE, UserGender.FEMALE]);
  user.birthDate = faker.datatype.datetime();
  user.lat = parseFloat(faker.address.latitude());
  user.lng = parseFloat(faker.address.longitude());
  user.bio = faker.lorem.sentence();

  return user;
});
