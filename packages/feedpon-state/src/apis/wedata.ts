import { type UpFetch, up } from 'up-fetch';
import * as v from 'valibot';

export const Item = v.object({
  resource_url: v.pipe(v.string(), v.url()),
  database_resource_url: v.pipe(v.string(), v.url()),
  data: v.any(),
  created_by: v.string(),
  name: v.string(),
  created_at: v.pipe(v.string(), v.isoDateTime()),
  updated_at: v.pipe(v.string(), v.isoDateTime()),
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

  async getDatabaseItems(name: string): Promise<v.InferOutput<typeof Item>[]> {
    return this._upfetch(
      `/database/${encodeURIComponent(name)}/itesm_all.json`,
      {
        schema: v.array(Item),
      },
    );
  }
}
