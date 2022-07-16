import { User } from './../entity/UserEntities/User';
import session from 'express-session';

declare module 'express-session' {
  export interface SessionData {
    userId: number | undefined;
    user: User | undefined;
  }
}
