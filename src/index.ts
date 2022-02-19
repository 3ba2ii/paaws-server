import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { graphqlUploadExpress } from 'graphql-upload';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { createConnection, useContainer } from 'typeorm';
import { Container } from 'typeorm-typedi-extensions';
import { COOKIE_NAME, __prod__ } from './constants';
import { createApolloServer } from './utils/createApolloServer';

require('dotenv-safe').config();

useContainer(Container);
//
const main = async () => {
  const conn = await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: !__prod__,
    logging: true,
    entities: [path.join(__dirname, '/entity/**/*.js')],
    migrations: [path.join(__dirname, '/migration/*.js')],
    migrationsTableName: 'migrations',

    cli: {
      migrationsDir: path.join(__dirname, '/migration'),
    },
  });
  //
  const app = express();
  __prod__ && (await conn.runMigrations());

  // Redis session store
  const RedisStore = connectRedis(session);
  const redis = new Redis(process.env.REDIS_URL);

  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: [
        'http://localhost:3000',
        process.env.CORS_ORIGIN,
        'https://studio.apollographql.com',
      ],
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
        sameSite: __prod__ ? 'none' : 'lax', // CSRF protection
        secure: __prod__, // cookie only works in https on production
        domain: __prod__ ? '.3ba2i.software' : undefined,
      },
      saveUninitialized: false, //force a new session but not modified to be saved to the store
      secret: process.env.SESSION_REDIS_SECRET_KEY,
      resave: false, // don't save session if unmodified
    })
  );
  app.use(graphqlUploadExpress());

  /* Passport Configuration */

  const apolloServer = await createApolloServer(redis);

  await apolloServer.start();

  //Creating a GraphQL endpoint
  apolloServer.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: [
        'http://localhost:3000',
        process.env.CORS_ORIGIN,
        'https://studio.apollographql.com',
      ],
    },
  });

  const port = parseInt(process.env.PORT) || 4000;

  app.listen(port, () => {
    console.log(`🚀 Now listening on port http://localhost:${port}/graphql`);
  });
};

main().catch((err) => {
  console.error(err);
});
