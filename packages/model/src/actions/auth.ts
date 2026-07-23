import type { FeedlyCredential } from '@feedpon/feedly-client';
import type { AppAction } from '../index.ts';

export function acquireCredential(): AppAction<Promise<FeedlyCredential>> {
  return async (
    state$,
    { feedlyAuthMutex, feedlyAuthenticator, feedlyClient },
  ) => {
    const credential$ = state$.get('credential');
    const authenticating$ = state$.get('authenticating');

    await feedlyAuthMutex.lock();

    try {
      if (credential$.value !== null) {
        const { expiresIn, refreshToken, timestamp } = credential$.value;
        const now = Date.now();
        const skew = 1000 * 60;
        const expiredAt = timestamp + expiresIn;

        if (now + skew >= expiredAt) {
          const tokens = await feedlyClient.refreshToken(refreshToken);
          credential$.value = {
            id: tokens.id,
            accessToken: tokens.access_token,
            refreshToken,
            expiresIn: tokens.expires_in,
            timestamp: Date.now(),
          };
        }
      } else {
        authenticating$.value = true;

        try {
          const code = await feedlyAuthenticator.authenticate(
            feedlyClient.authenticationUrl,
            feedlyClient.redirectUrl,
          );
          const tokens = await feedlyClient.exchangeCode(code);
          credential$.value = {
            id: tokens.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in,
            timestamp: Date.now(),
          };
        } finally {
          authenticating$.value = false;
        }
      }

      return credential$.value;
    } finally {
      feedlyAuthMutex.unlock();
    }
  };
}

export function getExportUrl(): AppAction<Promise<string>> {
  return async (_state$, { feedlyClient }, dispatch) => {
    const credential = await dispatch(acquireCredential());
    return (
      feedlyClient.baseUrl +
      'v3/opml' +
      new URLSearchParams({ feedlyToken: credential.accessToken })
    );
  };
}

export function revokeCredential(): AppAction<void> {
  return async (state$, { feedlyClient }) => {
    const credential$ = state$.get('credential');

    if (credential$.value !== null) {
      await feedlyClient.logout(credential$.value.accessToken);
      credential$.value = null;
    }
  };
}
