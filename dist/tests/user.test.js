"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = __importDefault(require("faker"));
const graphqlCall_1 = require("../test-utils/graphqlCall");
const testConn_1 = require("../test-utils/testConn");
let conn;
beforeAll(async () => {
    conn = await (0, testConn_1.createTestConnection)(false);
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
const registerMutation = `mutation RegisterMutation($registerOptions: RegisterOptions!) {
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
        const fakeUser = {
            identifier: faker_1.default.internet.email(),
            password: faker_1.default.internet.password(),
        };
        const { data } = await (0, graphqlCall_1.graphqlCall)({
            source: loginMutation,
            variableValues: {
                loginOptions: fakeUser,
            },
        });
        console.log(`🚀 ~ file: user.test.ts ~ line 51 ~ it ~ data`, data);
        expect(data === null || data === void 0 ? void 0 : data.login.errors).toBeDefined();
        expect(data === null || data === void 0 ? void 0 : data.login.user).toBeNull();
    });
    it('fake-register', async () => {
        const fakeNewUser = {
            email: 'lfalkinghamd@japanpost.jp',
            full_name: 'Testing',
            otp: 1234,
            password: 'Testtest123',
            phone: '+201029111777',
        };
        const { data } = await (0, graphqlCall_1.graphqlCall)({
            source: registerMutation,
            variableValues: {
                registerOptions: fakeNewUser,
            },
        });
        console.log(`🚀 ~ file: user.test.ts ~ line 70 ~ it ~ data`, data);
        expect(data === null || data === void 0 ? void 0 : data.register.errors.length).toEqual(0);
        expect(data === null || data === void 0 ? void 0 : data.register.user).toBeDefined();
        expect(data === null || data === void 0 ? void 0 : data.register.user.email).toEqual(fakeNewUser.email.toLowerCase());
        expect(data === null || data === void 0 ? void 0 : data.register.user.full_name).toEqual(fakeNewUser.full_name);
        expect(data === null || data === void 0 ? void 0 : data.register.user.phone).toEqual(fakeNewUser.phone);
    });
    it('valid-login', async () => {
        const realUser = {
            identifier: 'lfalkinghamd@japanpost.jp',
            password: 'Testtest123',
        };
        const { data } = await (0, graphqlCall_1.graphqlCall)({
            source: loginMutation,
            variableValues: {
                loginOptions: realUser,
            },
        });
        console.log(`🚀 ~ file: user.test.ts ~ line 37 ~ it ~ data`, data === null || data === void 0 ? void 0 : data.login.errors);
        expect(data === null || data === void 0 ? void 0 : data.login.errors.length).toEqual(0);
        expect(data === null || data === void 0 ? void 0 : data.login.user).toBeDefined();
    });
});
//# sourceMappingURL=user.test.js.map