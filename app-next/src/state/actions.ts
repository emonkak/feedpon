import type { Stream, Subscription } from '@feedpon/feedly-client';
import type { AppAction, Credential } from './store.ts';

// Refresh the token when it is within this time of expiring (5 minutes)
const TOKEN_REFRESH_SKEW = 1000 * 60 * 5;

export function acquireCredential(): AppAction<Promise<Credential>> {
  return (state$, context) => {
    const credential$ = state$.get('credential');
    const { authMutex, authenticator, feedlyClient } = context;

    return authMutex.scope(async () => {
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

export function changeIndex(id: string, index: number): AppAction<void> {
  return async (state$) => {
    state$.get('session').scope((session) => {
      if (session?.id === id) {
        session.index = index;
      }
    });
  };
}

export function loadStream(
  streamId: string,
  signal: AbortSignal,
): AppAction<Promise<Stream>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient, objectStoreManager } = context;
    const session$ = state$.get('session');

    let stream = await objectStoreManager.runTransaction(
      ['streams'],
      ({ streams }) => streams.get(streamId),
    );

    if (stream === undefined) {
      const credential = await dispatch(acquireCredential());
      stream = await feedlyClient.getStreamContents(
        credential.accessToken,
        streamId,
        {},
        { signal },
      );
      await objectStoreManager.runTransaction(
        ['streams'],
        ({ streams }) => streams.put(stream!),
        { mode: 'readwrite' },
      );
    }

    if (session$.value?.id !== stream.id) {
      session$.value = {
        id: stream.id,
        index: 0,
      };
    }

    return stream;
  };
}

export function loadSubscriptions(
  signal: AbortSignal,
): AppAction<Promise<Subscription[]>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient, objectStoreManager } = context;
    const serverState$ = state$.get('serverState');

    if (serverState$.value.lastSynced >= 0) {
      return await objectStoreManager.runTransaction(
        ['subscriptions'],
        ({ subscriptions }) => subscriptions.getAll(),
      );
    }

    const credential = await dispatch(acquireCredential());
    const subscriptions = await feedlyClient.getSubscriptions(
      credential.accessToken,
      { signal },
    );

    await objectStoreManager.runTransaction(
      ['subscriptions'],
      async ({ subscriptions: subscriptionStore }) => {
        for (const subscription of subscriptions) {
          subscriptionStore.put(subscription);
        }
      },
      { mode: 'readwrite' },
    );

    serverState$.scope((subscriptions) => {
      subscriptions.lastSynced = Date.now();
    });

    return subscriptions;
  };
}

export function revokeCredential(): AppAction<void> {
  return async (state$, context) => {
    const credential$ = state$.get('credential');
    const { feedlyClient } = context;

    if (credential$.value !== null) {
      await feedlyClient.logout(credential$.value.accessToken);
      credential$.value = null;
    }
  };
}
