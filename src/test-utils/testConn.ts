import path from 'path';
import { createConnection } from 'typeorm';

export const createTestConnection = (drop: boolean = false) =>
  createConnection({
    type: 'postgres',
    database: 'paaws_v1_test',
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: drop,
    logging: true,
    dropSchema: drop,

    entities: [path.join(__dirname, '../entity/**/*{.ts,.js}')],
  });
