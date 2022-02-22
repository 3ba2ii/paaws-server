import { ProviderTypes } from './../../types/enums.types';
import { GoogleAuthProvider } from './google-auth.provider';

type ExternalAuthProviderTypes = GoogleAuthProvider | null;

export function getAuthClient(
  provider: ProviderTypes,
  idToken: string
): ExternalAuthProviderTypes {
  switch (provider) {
    case ProviderTypes.GOOGLE:
      return new GoogleAuthProvider(idToken);
    default:
      return null;
  }
}
