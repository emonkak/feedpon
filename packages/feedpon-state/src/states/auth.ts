import type { Reactive } from 'barebind/extras/reactive';
import type * as v from 'valibot';

import type {
  FeedlyAuthCode,
  FeedlyClient,
  FeedlyCredential,
  UserProfile,
} from '../apis/feedly.ts';

export type AuthAction<T> = (context: AuthContext) => T;

export interface AuthContext {
  authenticator: Authenticator;
  feedlyClient: FeedlyClient;
  state$: Reactive<{ authState: AuthState }>;
}

export class AuthState {
  authenticating: boolean = false;
  credential: FeedlyCredential | null = null;
  userProfile: UserProfile | null = null;
}

export interface Authenticator {
  acquireLock(): Promise<void>;
  releaseLock(): void;
  authenticate(url: URL): Promise<FeedlyAuthCode>;
}

export type UserProfile = v.InferOutput<typeof UserProfile>;

export const acquireCredential: AuthAction<Promise<FeedlyCredential>> = ({
  authenticator,
  feedlyClient,
  state$,
}) => {
  const authState$ = state$.get('authState');

  return authState$.mutate(async (state) => {
    await authenticator.acquireLock();

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
          const code = await authenticator.authenticate(authUrl);
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
      authenticator.releaseLock();
    }
  });
};

export const reloadUserProfile: AuthAction<void> = ({
  feedlyClient,
  state$,
}) => {
  const authState$ = state$.get('authState');

  return authState$.mutate(async (state) => {
    if (state.credential !== null) {
      state.userProfile = await feedlyClient.getUserProfile(
        state.credential.accessToken,
      );
    }
  });
};

export const revokeCredential: AuthAction<void> = ({
  feedlyClient,
  state$,
}) => {
  const authState$ = state$.get('authState');

  return authState$.mutate(async (state) => {
    if (state.credential !== null) {
      await feedlyClient.logout(state.credential.accessToken);

      state.credential = null;
    }
  });
};
