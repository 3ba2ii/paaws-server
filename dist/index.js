"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const graphql_upload_1 = require("graphql-upload");
const ioredis_1 = __importDefault(require("ioredis"));
const path_1 = __importDefault(require("path"));
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const constants_1 = require("./constants");
const createApolloServer_1 = require("./utils/createApolloServer");
const typeorm_typedi_extensions_1 = require("typeorm-typedi-extensions");
require('dotenv-safe').config();
(0, typeorm_1.useContainer)(typeorm_typedi_extensions_1.Container);
const main = async () => {
    const conn = await (0, typeorm_1.createConnection)({
        type: 'postgres',
        host: process.env.POSTGRES_HOST || '127.0.0.1',
        database: process.env.POSTGRES_DB,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        port: (process.env.POSTGRES_PORT || 5432),
        synchronize: true,
        logging: !constants_1.__prod__,
        entities: [path_1.default.join(__dirname, '/entity/**/*.js')],
        migrations: [path_1.default.join(__dirname, '/migration/*.js')],
        migrationsTableName: 'migrations',
        cli: {
            migrationsDir: path_1.default.join(__dirname, '/migration'),
        },
    });
    const app = (0, express_1.default)();
    await conn.runMigrations();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use((0, cors_1.default)({
        origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: constants_1.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: 'lax',
        },
        saveUninitialized: false,
        secret: process.env.SESSION_REDIS_SECRET_KEY + '',
        resave: false,
    }));
    app.use((0, graphql_upload_1.graphqlUploadExpress)());
    const apolloServer = await (0, createApolloServer_1.createApolloServer)(redis);
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
    app.listen(4000, () => {
        console.log(`🚀 Now listening on port http://localhost:4000/graphql`);
    });
};
main();
//# sourceMappingURL=index.js.map