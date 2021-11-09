"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestConnection = void 0;
const path_1 = __importDefault(require("path"));
const typeorm_1 = require("typeorm");
const createTestConnection = (drop = false) => (0, typeorm_1.createConnection)({
    type: 'postgres',
    database: 'paaws_v1_test',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: drop,
    logging: true,
    dropSchema: drop,
    entities: [path_1.default.join(__dirname, '../entity/**/*{.ts,.js}')],
});
exports.createTestConnection = createTestConnection;
//# sourceMappingURL=testConn.js.map