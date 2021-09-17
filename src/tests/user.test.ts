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
    for (let i = 0; i < 10; i++) {
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

      /* expect(data?.login).toMatchObject({
        errors: expect.arrayContaining([FieldError]),
        user: null,
      }); */
      expect(data?.login.errors).toBeDefined();
    }

    //Register
    /* 
    const newUserPhone = '+201029111763';
    const sendOTPResponse = await graphqlTestCall(sendOTPMutation, {
      sendOtpPhone: newUserPhone,
    });
    console.log(
      `🚀 ~ file: user.test.ts ~ line 38 ~ it ~ sendOTPResponse`,
      sendOTPResponse
    );

    expect(sendOTPResponse).toEqual({ success: true }); */
    /* 
    const foundUser = {
      email: 'aghonem2011@gmail.com',
      password: 'Ahmed3ba2ii',
    };

    loginResponse = await graphqlTestCall(loginMutation, {
      loginOptions: {
        identifier: foundUser.email,
        password: foundUser.password,
      },
    });

    expect(loginResponse.errors).toBeNull();
    expect(loginResponse.data).toBeDefined();
    expect(loginResponse.data?.user).toBeDefined(); */
  });
});
/* 
const sendOTPMutation = `
mutation ( $sendOtpPhone: String!){
    sendOTP(phone: $sendOtpPhone) {
      success
    }
  }`; */

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

/* const usersQuery = `
query UsersQuery {
    users {
        id
        email
    }
  }`;
 */
