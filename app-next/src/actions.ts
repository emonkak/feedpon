import type { AppAction, Credential } from './store.ts';

// Refresh the token when it is within this time of expiring (5 minutes)
const TOKEN_REFRESH_SKEW = 1000 * 60 * 5;

export function acquireCredential(): AppAction<Promise<Credential>> {
  return (state$, context) => {
    const credential$ = state$.get('credential');
    const { authenticator, feedlyClient } = context;

    return navigator.locks.request('app.credential', async () => {
      if (credential$.value !== null) {
        const { expiresIn, refreshToken, refreshedAt } = credential$.value;
        const now = Date.now();
        const expiredAt = refreshedAt + expiresIn;

        if (now + TOKEN_REFRESH_SKEW >= expiredAt) {
          const tokens = await feedlyClient.refreshToken(refreshToken);
          credential$.value = {
            id: tokens.id,
            accessToken: tokens.access_token,
            refreshToken,
            expiresIn: tokens.expires_in,
            refreshedAt: Date.now(),
          };
        }
      } else {
        const code = await authenticator.authenticate(
          feedlyClient.getAuthenticationURL(),
          feedlyClient.getRedirectURL(),
        );
        const tokens = await feedlyClient.exchangeCode(code);
        credential$.value = {
          id: tokens.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresIn: tokens.expires_in,
          refreshedAt: Date.now(),
        };
      }

      return credential$.value;
    });
  };
}
