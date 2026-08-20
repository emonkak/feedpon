import type * as feedly from '@feedpon/feedly-client';
import type { AppAction, Credential, Session } from './store.ts';

// Refresh the token when it is within this time of expiring (5 minutes)
const TOKEN_REFRESH_SKEW = 1000 * 60 * 5;

export function acquireCredential(): AppAction<Promise<Credential>> {
  return (state$, context) => {
    const credential$ = state$.get('credential');
    const { authMutex, authenticator, feedlyClient } = context;

    return authMutex.scope(async () => {
      if (credential$.value !== null) {
        const { expiresIn, refreshToken, refreshed } = credential$.value;
        const now = Date.now();
        const expiredAt = refreshed + expiresIn;

        if (now + TOKEN_REFRESH_SKEW >= expiredAt) {
          const tokens = await feedlyClient.refreshToken(refreshToken);
          credential$.value = {
            id: tokens.id,
            accessToken: tokens.access_token,
            refreshToken,
            expiresIn: tokens.expires_in * 1000,
            refreshed: Date.now(),
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
          refreshed: Date.now(),
        };
      }

      return credential$.value;
    });
  };
}

export function loadStream(
  streamId: string,
  session: Session,
  signal: AbortSignal,
): AppAction<Promise<feedly.Stream>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient, objectStoreManager } = context;
    const lastSynced = state$.scope(
      ({ serverState }) => serverState.lastSynced,
    );

    if (session.started > lastSynced) {
      const cachedStreams = await objectStoreManager.runTransaction(
        ['streams'],
        (stores) =>
          stores.streams.getAll(
            IDBKeyRange.bound([streamId, 0], [streamId, Infinity], true, true),
          ),
      );
      if (cachedStreams.length > 0) {
        return cachedStreams.reduce((stream, cachedStream) => {
          return { ...stream, items: stream.items.concat(cachedStream.items) };
        });
      }
    } else {
      await objectStoreManager.runTransaction(
        ['streams'],
        (stores) =>
          stores.streams.delete(
            IDBKeyRange.bound([streamId, 0], [streamId, Infinity], true, true),
          ),
        { mode: 'readwrite' },
      );
    }

    const credential = await dispatch(acquireCredential());
    const stream = await feedlyClient.getStreamContents(
      credential.accessToken,
      streamId,
      {},
      { signal },
    );

    await objectStoreManager.runTransaction(
      ['streams'],
      (stores) => stores.streams.put(stream!),
      { mode: 'readwrite' },
    );

    state$.get('session').value = session;

    return stream;
  };
}

export function loadSubscriptions(
  signal: AbortSignal,
): AppAction<Promise<feedly.Subscription[]>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient, objectStoreManager } = context;
    const serverState$ = state$.get('serverState');
    const lastSynced = serverState$.scope(({ lastSynced }) => lastSynced);

    if (lastSynced >= 0) {
      return await objectStoreManager.runTransaction(
        ['subscriptions'],
        (stores) => stores.subscriptions.getAll(),
      );
    }

    const credential = await dispatch(acquireCredential());
    const subscriptions = await feedlyClient.getSubscriptions(
      credential.accessToken,
      { signal },
    );

    await objectStoreManager.runTransaction(
      ['subscriptions'],
      async (stores) => {
        for (const subscription of subscriptions) {
          stores.subscriptions.put(subscription);
        }
      },
      { mode: 'readwrite' },
    );

    serverState$.scope((serverState) => {
      serverState.lastSynced = Date.now();
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

export function startSession(streamId: string): AppAction<Promise<Session>> {
  return async (state$, context) => {
    const { objectStoreManager } = context;
    const session$ = state$.get('session');
    const session = session$.value;

    if (session?.id === streamId) {
      return session;
    }

    if (session !== null) {
      await objectStoreManager.runTransaction(
        ['sessions'],
        (stores) => stores.sessions.put(session),
        { mode: 'readwrite' },
      );
    }

    return {
      id: streamId,
      index: 0,
      started: Date.now(),
    };
  };
}

export function updateSession(session: Session): AppAction<Promise<void>> {
  return async (state$) => {
    state$.get('session').value = session;
  };
}
