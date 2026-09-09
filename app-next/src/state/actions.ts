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

export function getStream(
  session: Session,
  signal: AbortSignal,
): AppAction<Promise<feedly.Stream>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient, objectStoreManager } = context;
    const version = state$.get('serverState').get('version').value;

    if (session.version >= version) {
      const streams = await objectStoreManager.runTransaction(
        ['streams'],
        (stores) =>
          stores.streams.getAll(
            IDBKeyRange.bound([session.id, 0], [session.id, Infinity]),
          ),
      );
      if (streams.length > 0) {
        return streams.reduce((prevStream, nextStream) => ({
          ...nextStream,
          items: prevStream.items.concat(nextStream.items),
        }));
      }
    } else {
      await objectStoreManager.runTransaction(
        ['streams'],
        (stores) =>
          stores.streams.delete(
            IDBKeyRange.bound([session.id, 0], [session.id, Infinity]),
          ),
        { mode: 'readwrite' },
      );
    }

    const credential = await dispatch(acquireCredential());
    const stream = await feedlyClient.getStreamContents(
      credential.accessToken,
      session.id,
      {},
      { signal },
    );

    await objectStoreManager.runTransaction(
      ['streams'],
      (stores) => stores.streams.put(stream, [stream.id, 0]),
      { mode: 'readwrite' },
    );

    state$.get('session').scope((currentSession) => {
      if (
        currentSession?.id === session.id &&
        currentSession.version < version
      ) {
        currentSession.version = version;
      }
    });

    return stream;
  };
}

export function reloadSubscriptions(): AppAction<Promise<void>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient } = context;
    const subscriptions$ = state$.get('subscriptions');
    const unreadCounts$ = state$.get('unreadCounts');
    const lastSynced$ = state$.get('serverState').get('lastSynced');
    const version$ = state$.get('serverState').get('version');

    const credential = await dispatch(acquireCredential());
    const [subscriptions, unreadCounts] = await Promise.all([
      feedlyClient.getSubscriptions(credential.accessToken),
      feedlyClient.getUnreadCounts(credential.accessToken),
    ]);
    const shouldIncrementVersion = lastSynced$.value >= 0;

    subscriptions$.value = subscriptions;
    unreadCounts$.value = unreadCounts.unreadcounts;
    lastSynced$.value = Date.now();
    if (shouldIncrementVersion) {
      version$.value++;
    }
  };
}

export function updateScrollIndex(
  streamId: string,
  scrollIndex: number,
): AppAction<void> {
  return (state$) => {
    state$.get('session').scope((session) => {
      if (session?.id === streamId) {
        session.scrollIndex = scrollIndex;
      }
    });
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
    const version = state$.get('serverState').get('version').value;

    if (session?.id === streamId && session.version >= version) {
      return session;
    }

    if (session !== null) {
      await objectStoreManager.runTransaction(
        ['sessions'],
        (stores) => stores.sessions.put(session),
        { mode: 'readwrite' },
      );
    }

    let newSession = await objectStoreManager.runTransaction(
      ['sessions'],
      (stores) => stores.sessions.get(streamId),
    );

    if (newSession === undefined || newSession.version < version) {
      newSession = {
        id: streamId,
        scrollIndex: 0,
        version: -1,
      };
    }

    session$.value = newSession;

    return newSession;
  };
}
