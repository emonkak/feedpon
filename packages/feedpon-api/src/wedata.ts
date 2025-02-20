import createClient, { type Client } from 'openapi-fetch';

import type * as wedata from './api/wedata.ts';

export function createWedataClient(): Client<wedata.paths> {
  const client = createClient<wedata.paths>({
    baseUrl: 'http://wedata.net',
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
