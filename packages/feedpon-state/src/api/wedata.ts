import createClient, { type Client } from 'openapi-fetch';

import type * as Wedata from './wedataTypes.ts';

export type WedataClient = Client<Wedata.paths>;

export function createWedataClient(): WedataClient {
  return createClient<Wedata.paths>({
    baseUrl: 'http://wedata.net',
  });
}
