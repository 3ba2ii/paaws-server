import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { createApolloServer } from './utils/createApolloServer';
require('dotenv-safe').config();

const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    logging: true,
    entities: [path.join(__dirname, '/entity/*.js')],
    migrations: [path.join(__dirname, '/migration/*.ts')],
    migrationsTableName: 'migrations',
    cli: {
      migrationsDir: 'src/migration',
    },
  });

  const app = express();
  await conn.runMigrations();

  // Redis session store
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  app.use(
    cors({
      origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
      credentials: true,
    })
  );

  // Applying redis session store
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: __prod__, // cookie only works in https on production
        sameSite: 'lax', // CSRF protection
      },
      saveUninitialized: false,
      secret: process.env.SESSION_REDIS_SECRET_KEY + '',
      resave: false, // don't save session if unmodified
    })
  );

  const apolloServer = await createApolloServer(redis);

  await apolloServer.start();

  //Creating a GraphQL endpoint
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  app.listen(4000, () => {
    console.log(`🚀 Now listening on port http://localhost:4000/graphql`);
  });
};

main();
