import faker from 'faker';
import { Connection } from 'typeorm';
import { graphqlCall } from '../test-utils/graphqlCall';
import { createTestConnection } from '../test-utils/testConn';
import { LoginInput } from './../types/_responseTypes';

let conn: Connection;
beforeAll(async () => {
  conn = await createTestConnection();
});

afterAll(async () => {
  await conn.close();
});

describe('resolvers', () => {
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

    expect(data?.login.errors).toBeDefined();
    expect(data?.login.user).toBeNull();
  });
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
