import type { AppAction } from '../action.ts';
import type { FeedlyCredential } from '../apis/feedly.ts';

export function acquireCredential(): AppAction<Promise<FeedlyCredential>> {
  return ({ feedlyAuthLock, feedlyAuthenticator, feedlyClient, state$ }) => {
    return state$.mutate(async (state) => {
      await feedlyAuthLock.acquire();

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
        feedlyAuthLock.release();
      }
    });
  };
}

export function getExportUrl(): AppAction<Promise<string>> {
  return async (context) => {
    const { feedlyClient } = context;
    const credential = await acquireCredential()(context);
    return (
      feedlyClient.baseUrl +
      'v3/opml' +
      new URLSearchParams({ feedlyToken: credential.accessToken })
    );
  };
}

export function revokeCredential(): AppAction<void> {
  return ({ feedlyClient, state$ }) => {
    return state$.mutate(async (state) => {
      if (state.credential !== null) {
        await feedlyClient.logout(state.credential.accessToken);

        state.credential = null;
      }
    });
  };
}
