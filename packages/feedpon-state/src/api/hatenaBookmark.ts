import createClient, { type Client } from 'openapi-fetch';

import type * as HatenaBookmark from './hatenaBookmarkTypes.d.ts';

export type HatenaBookmarkClient = Client<HatenaBookmark.paths>;

export function createHatenaBookmarkClient(): HatenaBookmarkClient {
  return createClient<HatenaBookmark.paths>({
    baseUrl: 'https://bookmark.hatenaapis.com',
  });
}
