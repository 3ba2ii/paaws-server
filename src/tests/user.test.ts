import faker from 'faker';
import { Connection } from 'typeorm';
import { graphqlCall } from '../test-utils/graphqlCall';
import { createTestConnection } from '../test-utils/testConn';
import { LoginInput, BaseRegisterInput } from '../types/input.types';

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

const registerMutation = `mutation RegisterMutation($registerOptions: BaseRegisterInput!) {
    register(registerOptions: $registerOptions) {
      user {
        id
        email
        
      }
      errors {
        field
        message
        code
      }
    }
  }`;
describe('login unit-test', () => {
  it('fake-login', async () => {
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

    console.log(`🚀 ~ file: user.test.ts ~ line 51 ~ it ~ data`, data);
    expect(data?.login.errors).toBeDefined();
    expect(data?.login.user).toBeNull();
  });

  it('fake-register', async () => {
    const fakeNewUser: BaseRegisterInput = {
      email: 'lfalkinghamd@japanpost.jp',
      full_name: 'Testing',
      password: 'Testtest123',
    };
    const { data } = await graphqlCall({
      source: registerMutation,

      variableValues: {
        registerOptions: fakeNewUser,
      },
    });
    console.log(`🚀 ~ file: user.test.ts ~ line 70 ~ it ~ data`, data);

    expect(data?.register.errors.length).toEqual(0);
    expect(data?.register.user).toBeDefined();
    expect(data?.register.user.email).toEqual(fakeNewUser.email.toLowerCase());
    expect(data?.register.user.full_name).toEqual(fakeNewUser.full_name);
  });

  it('valid-login', async () => {
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
  });
});
