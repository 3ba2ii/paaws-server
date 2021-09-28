import connectRedis from 'connect-redis';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { graphqlUploadExpress } from 'graphql-upload';
import Redis from 'ioredis';
import path from 'path';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { COOKIE_NAME, __prod__ } from './constants';
import { createApolloServer } from './utils/createApolloServer';

require('dotenv-safe').config();

const main = async () => {
  console.log(path.join(__dirname, '/migration/*.js'));
  const conn = await createConnection({
    type: 'postgres',
    database: process.env.POSTGRES_DB,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    dropSchema: true,
    logging: !__prod__,
    entities: [path.join(__dirname, '/entity/**/*.js')],
    migrations: [path.join(__dirname, '/migration/*.js')],
    migrationsTableName: 'migrations',
    cli: {
      migrationsDir: path.join(__dirname, '/migration'),
    },
  });

  const app = express();
  await conn.runMigrations(); //

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
  app.use(graphqlUploadExpress());

  /* cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }); */

  const apolloServer = await createApolloServer(redis);

  await apolloServer.start();

  //Creating a GraphQL endpoint
  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  //applying static routes 'public'
  app.use(express.static(path.join(__dirname, 'public')));

  app.listen(4000, () => {
    console.log(`🚀 Now listening on port http://localhost:4000/graphql`);
  });
};

main();
