import { OAuth2Client } from 'google-auth-library';
import { ProviderTypes } from './../../types/enums.types';

export type ExternalUserInfo = {
  full_name: string;
  email: string;
  providerId: string;
  provider: ProviderTypes;
  picture?: string;
};

export interface IExternalAuthProvider {
  /* must have three main methods:
        1. getUserId()
        2. getUserInfo()
        3. getProvider()
        4. getProviderId()
        5. getClient()
    */
  provider: ProviderTypes;
  getProviderId(): Promise<string | null>;
  getUser(): Promise<ExternalUserInfo | null>;
  getClient(): Promise<OAuth2Client>;
  verifyAuthToken(): Promise<void>;
}
