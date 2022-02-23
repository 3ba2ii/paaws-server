import { createSchema } from './../utils/createSchema';
import faker from 'faker';
import { Connection } from 'typeorm';
import { graphqlCall } from '../test-utils/graphqlCall';
import { createTestConnection } from '../test-utils/testConn';
import { LoginInput } from '../types/input.types';
import { User } from './../entity/UserEntities/User';
import { BaseRegisterInput } from './../types/input.types';

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConnection(false);
});

afterAll(async () => {
  await conn.close();
});

const loginMutation = `
mutation LoginMutation($loginOptions: LoginInput!) {
    login(options: $loginOptions) {
      errors {
        field
        message
      }
      user {
        id
        email
      }
    }
  }`;
const registerMutation = `
      mutation Register($registerOptions: BaseRegisterInput!) {
        register(registerOptions: $registerOptions) {
          errors {
            field
            message
            code
          }
          user {
            id
            email
            phone
            provider
            providerId
            phoneVerified
          }
        }
      }`;

describe('login unit-test', () => {
  it('login-with-email-password', async () => {
    const fakeUser: LoginInput = {
      identifier: faker.internet.email(),
      password: faker.internet.password(),
    };
    const { data } = await graphqlCall({
      source: loginMutation,
      variableValues: {
        loginOptions: fakeUser,
      },
    });

    expect(data?.login.errors).toBeDefined();
    expect(data?.login.user).toBeNull();
  });

  it('register-with-email-password', async () => {
    const testServer = await createSchema();

    const full_name = faker.name.findName();
    const email = faker.internet.email();
    const password = faker.internet.password();
    const fakeUser: BaseRegisterInput = {
      full_name,
      email,
      password,
      confirmPassword: password,
    };
    const { data } = await graphqlCall({
      source: registerMutation,
      variableValues: { registerOptions: fakeUser },
    });
    console.log(`🚀 ~ file: auth.test.ts ~ line 79 ~ it ~ data`, data);

    expect(data?.login.errors).toBeNull();
    expect(data?.login.user).toBeDefined();

    const user = data?.login.user as User;

    expect(user.full_name).toEqual(full_name);
    expect(user.email).toEqual(email);
    expect(user.providerId).toBeNull();
  });

  /* it('valid-login', async () => {
    const realUser: LoginInput = {
      identifier: 'lfalkinghamd@japanpost.jp',
      password: 'Testtest123',
    };
    const { data } = await graphqlCall({
      source: loginMutation,
      variableValues: {
        loginOptions: realUser,
      },
    });
    console.log(
      `🚀 ~ file: user.test.ts ~ line 37 ~ it ~ data`,
      data?.login.errors
    );

    expect(data?.login.errors.length).toEqual(0);
    expect(data?.login.user).toBeDefined();
  }); */
});
