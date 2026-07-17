import type { FeedlyCredential } from '@feedpon/feedly-client';
import type { AppAction } from '../index.ts';

export function acquireCredential(): AppAction<Promise<FeedlyCredential>> {
  return (state$, { feedlyAuthMutex, feedlyAuthenticator, feedlyClient }) => {
    return state$.scope(async (state) => {
      await feedlyAuthMutex.lock();

      try {
        if (state.credential !== null) {
          const { expiresIn, refreshToken, timestamp } = state.credential;
          const now = Date.now();
          const skew = 1000 * 60;
          const expiredAt = timestamp + expiresIn;

          if (now + skew >= expiredAt) {
            const tokens = await feedlyClient.refreshToken(refreshToken);
            state.credential = {
              id: tokens.id,
              accessToken: tokens.access_token,
              refreshToken,
              expiresIn: tokens.expires_in,
              timestamp: Date.now(),
            };
          }
        } else {
          state.authenticating = true;

          try {
            const code = await feedlyAuthenticator.authenticate(
              feedlyClient.authenticationUrl,
              feedlyClient.redirectUrl,
            );
            const tokens = await feedlyClient.exchangeCode(code);
            state.credential = {
              id: tokens.id,
              accessToken: tokens.access_token,
              refreshToken: tokens.refresh_token,
              expiresIn: tokens.expires_in,
              timestamp: Date.now(),
            };
          } finally {
            state.authenticating = false;
          }
        }

        return state.credential;
      } finally {
        feedlyAuthMutex.unlock();
      }
    });
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
  return (state$, { feedlyClient }) => {
    return state$.scope(async (state) => {
      if (state.credential !== null) {
        await feedlyClient.logout(state.credential.accessToken);

        state.credential = null;
      }
    });
  };
}
