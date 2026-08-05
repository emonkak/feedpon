export type AuthCode = string;

export interface Authenticator {
  authenticate(
    authenticationURL: string,
    redirectURL: string,
  ): Promise<AuthCode>;
}
