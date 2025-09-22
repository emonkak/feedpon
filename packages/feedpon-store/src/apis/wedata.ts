import { type UpFetch, up } from 'up-fetch';
import * as v from 'valibot';

export const DatabaseItem = v.object({
  resource_url: v.pipe(v.string(), v.url()),
  database_resource_url: v.pipe(v.string(), v.url()),
  data: v.unknown(),
  created_by: v.string(),
  name: v.string(),
  created_at: v.pipe(v.string(), v.isoDateTime()),
  updated_at: v.pipe(v.string(), v.isoDateTime()),
});

export const AutoPagerizeItem = v.object({
  ...DatabaseItem.entries,
  data: v.object({
    url: v.string(),
    nextLink: v.string(),
    pageElement: v.string(),
    exampleUrl: v.optional(v.string()),
    insertBefore: v.optional(v.string()),
  }),
});

export interface WedataClientOptions {
  fetch?: typeof fetch;
}

export class WedataClient {
  private readonly _upfetch: UpFetch;

  constructor(options: WedataClientOptions = {}) {
    this._upfetch = up(options.fetch ?? fetch, () => ({
      baseUrl: 'http://wedata.net',
    }));
  }

  async getAutoPagerizeItems(): Promise<
    v.InferOutput<typeof AutoPagerizeItem>[]
  > {
    return this._upfetch(`/database/AutoPagerize/itesm_all.json`, {
      schema: v.array(AutoPagerizeItem),
    });
  }
}
