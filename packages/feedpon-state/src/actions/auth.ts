import type { AppAction } from '../action.ts';
import type { FeedlyCredential } from '../apis/feedly.ts';

export const acquireCredential: AppAction<Promise<FeedlyCredential>> = ({
  feedlyAuthenticator,
  feedlyClient,
  state$,
}) => {
  return state$.mutate(async (state) => {
    await feedlyAuthenticator.acquireLock();

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
          const authUrl = feedlyClient.getAuthUrl();
          const code = await feedlyAuthenticator.authenticate(authUrl);
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
      feedlyAuthenticator.releaseLock();
    }
  });
};

export const reloadUserProfile: AppAction<void> = ({
  feedlyClient,
  state$,
}) => {
  return state$.mutate(async (state) => {
    if (state.credential !== null) {
      state.userProfile = await feedlyClient.getUserProfile(
        state.credential.accessToken,
      );
    }
  });
};

export const revokeCredential: AppAction<void> = ({ feedlyClient, state$ }) => {
  return state$.mutate(async (state) => {
    if (state.credential !== null) {
      await feedlyClient.logout(state.credential.accessToken);

      state.credential = null;
    }
  });
};
