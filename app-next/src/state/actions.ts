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

export function reloadSubscriptions(): AppAction<
  Promise<feedly.Subscription[]>
> {
  return async (state$, context, dispatch) => {
    const { feedlyClient } = context;
    const lastSynced$ = state$.get('serverState').get('lastSynced');
    const subscriptions$ = state$.get('subscriptions');

    const credential = await dispatch(acquireCredential());
    const subscriptions = await feedlyClient.getSubscriptions(
      credential.accessToken,
    );

    lastSynced$.value = Date.now();
    subscriptions$.value = subscriptions;

    return subscriptions;
  };
}

export function updateScrollIndex(
  streamId: string,
  scrollIndex: number,
): AppAction<void> {
  return (state$) => {
    state$.get('session').scope((session) => {
      if (session?.stream.id === streamId) {
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

export function startSession(
  streamId: string,
  signal: AbortSignal,
): AppAction<Promise<Session>> {
  return async (state$, context, dispatch) => {
    const { feedlyClient, objectStoreManager } = context;
    const session$ = state$.get('session');
    const session = session$.value;
    const lastSynced = state$.get('serverState').get('lastSynced').value;

    if (session?.stream.id === streamId && session.started >= lastSynced) {
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

    if (newSession === undefined || newSession.started < lastSynced) {
      const credential = await dispatch(acquireCredential());
      const stream = await feedlyClient.getStreamContents(
        credential.accessToken,
        streamId,
        {},
        { signal },
      );
      newSession = {
        scrollIndex: 0,
        started: Date.now(),
        stream,
      };
    }

    session$.value = newSession;

    return newSession;
  };
}
