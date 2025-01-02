import createClient, { type Client } from 'openapi-fetch';

import type * as hatenaBookmark from './api/hatenaBookmark';

export type HatenaBookmarkAPI = typeof hatenaBookmark;

export function createHatenaBookmarkClient(): Client<hatenaBookmark.paths> {
  const client = createClient<hatenaBookmark.paths>({
    baseUrl: 'https://bookmark.hatenaapis.com',
  });
  client.use({
    async onError({ error, request }) {
      return new Error(`An error occurred while requesting "${request.url}".`, {
        cause: error,
      });
    },
  });
  return client;
}
