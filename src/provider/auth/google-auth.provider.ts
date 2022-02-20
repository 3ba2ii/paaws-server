import { ProviderTypes } from './../../types/enums.types';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { ExternalUserInfo, IExternalAuthProvider } from './auth.types';

export class GoogleAuthProvider implements IExternalAuthProvider {
  private client: OAuth2Client = new OAuth2Client(
    process.env.GOOGLE_AUTH_CLIENT_ID
  );
  private user: ExternalUserInfo | null = null;
  private idToken: string;
  private verified: boolean = false;
  public provider: ProviderTypes = ProviderTypes.GOOGLE;

  constructor(idToken: string) {
    this.setIdToken(idToken);
    this.verifyAuthToken();
  }

  private setIdToken = (idToken: string) => {
    this.idToken = idToken;
  };
  private setUser(payload: TokenPayload, providerId: string) {
    const { email, name, picture } = payload;
    if (!email || !name) throw new Error('email or name is undefined');
    this.user = {
      email,
      providerId,
      picture,
      provider: ProviderTypes.GOOGLE,
      full_name: name,
    };
  }

  async verifyAuthToken(): Promise<void> {
    try {
      if (!this.idToken) return;

      const ticket = await this.client.verifyIdToken({
        idToken: this.idToken,
        audience: process.env.GOOGLE_AUTH_CLIENT_ID,
      });

      const userId = ticket.getUserId();
      const payload = ticket.getPayload();

      if (!payload || !userId) {
        this.verified = false;
        return;
      }

      //set user info
      this.setUser(payload, userId);

      this.verified = true;
    } catch (err) {
      console.error(err);
      this.verified = false;
    }
  }

  async getProviderId(): Promise<string | null> {
    return this.idToken;
  }
  async getUser(): Promise<ExternalUserInfo | null> {
    return this.user;
  }
  async getClient(): Promise<OAuth2Client> {
    return this.client;
  }
  async isUserVerified(): Promise<boolean> {
    return this.verified;
  }
}
