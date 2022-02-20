import { GoogleAuthResolver } from './google-auth';
import { LocalAuthResolver } from './local-auth';

export const AuthProviderResolvers = [LocalAuthResolver, GoogleAuthResolver];
