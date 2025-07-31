import { Atom } from 'barebind/extensions/signal';
import createClient, { type Client } from 'openapi-fetch';

import type { AsyncAction, State, Store } from '../store.ts';
import type * as Feedly from './feedlyTypes.d.ts';

export type FeedlyClient = Client<Feedly.paths>;

export interface FeedlyAuthSeed {
  auth: FeedlyAuth | null;
  environment: FeedlyEnviroment;
}

const defaultSeed: FeedlyAuthSeed = {
  auth: null,
  environment: {
    baseUrl: 'https://cloud.feedly.com',
    clientId: 'feedly',
    clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
    redirectUrl: 'https://feedly.com/feedly.html',
    scope: 'https://cloud.feedly.com/subscriptions',
  },
};

export class FeedlyAuthState implements State<FeedlyAuthSeed> {
  readonly auth$: Atom<FeedlyAuth | null>;

  readonly environment$: Atom<FeedlyEnviroment>;

  readonly acquiringAuth$: Atom<Promise<FeedlyAuth> | null> =
    new Atom<Promise<FeedlyAuth> | null>(null);

  constructor(seed: FeedlyAuthSeed = defaultSeed) {
    this.auth$ = new Atom(seed.auth);
    this.environment$ = new Atom(seed.environment);
  }

  toSnapshot(): FeedlyAuthSeed {
    return {
      auth: this.auth$.value,
      environment: this.environment$.value,
    };
  }

  receiveAuth({ auth }: { auth: FeedlyAuth }): void {
    this.auth$.value = auth;
  }
}

export interface FeedlyAuth {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  timestamp: number;
}

export interface FeedlyEnviroment {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scope: string;
}

export interface FeedlyContext {
  authStore: Store<FeedlyAuthState>;
  authenticator: FeedlyAuthenticator;
  feedlyClient: FeedlyClient;
}

export interface FeedlyAuthenticator {
  authenticate(url: URL): Promise<FeedlyAuthCode>;
  acquire(callback: () => Promise<FeedlyAuth>): Promise<FeedlyAuth>;
}

export type FeedlyAuthCode = string;

export function acquireAuth(): AsyncAction<FeedlyContext, FeedlyAuth> {
  return ({ authenticator, feedlyClient, authStore }) => {
    return authenticator.acquire(async () => {
      let auth = authStore.state.auth$.value;

      if (auth !== null) {
        const now = Date.now();
        const skew = 1000 * 60;
        const expiredAt = auth.timestamp + auth.expiresIn;

        if (now + skew >= expiredAt) {
          const environment = authStore.state.environment$.value;
          auth = await refreshToken(feedlyClient, environment, auth);
          authStore.dispatch({ type: 'receiveAuth', auth });
        }
      } else {
        const environment = authStore.state.environment$.value;
        const url = makeAuthUrl(environment);
        const code = await authenticator.authenticate(url);
        auth = await issueToken(feedlyClient, environment, code);
        authStore.dispatch({ type: 'receiveAuth', auth });
      }

      return auth;
    });
  };
}

export function createFeedlyClient(
  authStore: Store<FeedlyAuthState>,
  authenticator: FeedlyAuthenticator,
): FeedlyClient {
  const environment = authStore.state.environment$.value;
  const client = createClient<Feedly.paths>({
    baseUrl: environment.baseUrl,
  });

  client.use({
    async onRequest({ request }) {
      if (new URL(request.url).pathname === '/auth/token') {
        return;
      }

      const auth = await acquireAuth()({
        authStore,
        authenticator,
        feedlyClient: client,
      });

      request.headers.set('Authorization', 'OAuth ' + auth.accessToken);

      return request;
    },
  });

  return client;
}

async function issueToken(
  client: FeedlyClient,
  enviroment: FeedlyEnviroment,
  code: FeedlyAuthCode,
): Promise<FeedlyAuth> {
  const { data, error } = await client.POST('/auth/{exchangeToken}', {
    params: {
      path: {
        exchangeToken: 'token',
      },
    },
    body: {
      code,
      client_id: enviroment.clientId,
      client_secret: enviroment.clientSecret,
      redirect_uri: enviroment.redirectUrl,
      grant_type: 'authorization_code',
    },
  });

  if (error !== undefined) {
    throw new Error('An error occurred during exchange token.', {
      cause: error,
    });
  }

  return {
    id: data.id,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    timestamp: Date.now(),
  };
}

function makeAuthUrl(environment: FeedlyEnviroment): URL {
  const url = new URL('/v3/auth/auth', environment.baseUrl);
  const { searchParams } = url;

  searchParams.set('client_id', environment.clientId);
  searchParams.set('redirect_uri', environment.redirectUrl);
  searchParams.set('response_type', 'code');
  searchParams.set('scope', environment.scope);

  return url;
}

async function refreshToken(
  client: FeedlyClient,
  enviroment: FeedlyEnviroment,
  auth: FeedlyAuth,
): Promise<FeedlyAuth> {
  const { data, error } = await client.POST('/auth/{refreshToken}', {
    params: {
      path: {
        refreshToken: 'token',
      },
    },
    body: {
      client_id: enviroment.clientId,
      client_secret: enviroment.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: auth.refreshToken,
    },
  });

  if (error !== undefined) {
    throw new Error('An error occurred during refresh token.', {
      cause: error,
    });
  }

  return {
    id: data.id,
    accessToken: data.access_token,
    refreshToken: auth.refreshToken,
    expiresIn: data.expires_in,
    timestamp: Date.now(),
  };
}
