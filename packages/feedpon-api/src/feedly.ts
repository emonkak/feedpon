import createClient, { type Middleware, type Client } from 'openapi-fetch';

import type * as feedly from './api/feedly.ts';

export type FeedlyAPI = typeof feedly;

export type FeedlyAuthCode = string;

export type FeedlyAuthFunction = (url: URL) => Promise<FeedlyAuthCode>;

export interface FeedlyAuthConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scope: string;
}

export interface FeedlyTokens {
  id: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  timestamp: number;
}

export class FeedlyAuthenticator {
  private _client: Client<feedly.paths>;

  private _authFunction: FeedlyAuthFunction;

  private _config: FeedlyAuthConfig;

  constructor(authFunction: FeedlyAuthFunction, config: FeedlyAuthConfig) {
    this._client = createClient<feedly.paths>({ baseUrl: config.baseUrl });
    this._authFunction = authFunction;
    this._config = config;
  }

  get baseUrl(): string {
    return this._config.baseUrl;
  }

  async issueToken(): Promise<FeedlyTokens> {
    const code = await this._authenticate();

    const { data, error } = await this._client.POST('/auth/{exchangeToken}', {
      params: {
        path: {
          exchangeToken: 'token',
        },
      },
      body: {
        code,
        client_id: this._config.clientId,
        client_secret: this._config.clientSecret,
        redirect_uri: this._config.redirectUrl,
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

  async refreshToken(tokens: FeedlyTokens): Promise<FeedlyTokens> {
    const { data, error, response } = await this._client.POST(
      '/auth/{refreshToken}',
      {
        params: {
          path: {
            refreshToken: 'token',
          },
        },
        body: {
          client_id: this._config.clientId,
          client_secret: this._config.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: tokens.refreshToken,
        },
      },
    );

    if (error !== undefined) {
      if (response.status === 403) {
        return await this.issueToken();
      } else {
        throw new Error('An error occurred during refresh token.', {
          cause: error,
        });
      }
    }

    return {
      id: data.id,
      accessToken: data.access_token,
      refreshToken: tokens.refreshToken,
      expiresIn: data.expires_in,
      timestamp: Date.now(),
    };
  }

  private _authenticate(): Promise<FeedlyAuthCode> {
    const url = new URL('/v3/auth/auth', this._config.baseUrl);

    url.searchParams.set('client_id', this._config.clientId);
    url.searchParams.set('redirect_uri', this._config.redirectUrl);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', this._config.scope);

    const fn = this._authFunction;
    return fn(url);
  }
}

export function createFeedlyAuthMiddleware(
  authenticator: FeedlyAuthenticator,
  getTokens: () => FeedlyTokens | null,
  setTokens: (tokens: FeedlyTokens | null) => void,
): Middleware {
  let acquiringTokens: Promise<FeedlyTokens> | null = null;

  return {
    async onRequest({ request }) {
      let tokens = getTokens();

      if (tokens !== null) {
        const now = Date.now();
        const skew = 1000 * 60;
        const expiredAt = tokens.timestamp + tokens.expiresIn;

        if (now + skew >= expiredAt) {
          try {
            tokens = await (acquiringTokens ??=
              authenticator.refreshToken(tokens));
            setTokens(tokens);
          } finally {
            acquiringTokens = null;
          }
        }
      } else {
        try {
          tokens = await (acquiringTokens ??= authenticator.issueToken());
          setTokens(tokens);
        } finally {
          acquiringTokens = null;
        }
      }

      request.headers.set('Authorization', 'OAuth ' + tokens.accessToken);

      return request;
    },
  };
}

export function createFeedlyClient(
  authenticator: FeedlyAuthenticator,
  getTokens: () => FeedlyTokens | null,
  setTokens: (tokens: FeedlyTokens | null) => void,
): Client<feedly.paths> {
  const client = createClient<feedly.paths>({ baseUrl: authenticator.baseUrl });

  client.use(createFeedlyAuthMiddleware(authenticator, getTokens, setTokens));

  client.use({
    async onError({ error, request }) {
      return new Error(`An error occurred while requesting "${request.url}".`, {
        cause: error,
      });
    },
  });

  return client;
}
