import { ExternalProviderAuthResolver } from './external-provider-auth';
import { LocalAuthResolver } from './local-auth';

export const AuthProviderResolvers = [
  LocalAuthResolver,
  ExternalProviderAuthResolver,
];
