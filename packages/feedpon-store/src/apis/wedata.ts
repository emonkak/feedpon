import { type UpFetch, up } from 'up-fetch';

export interface DatabaseItem<T> {
  resource_url: string;
  database_resource_url: string;
  data: T;
  created_by: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface AutoPagerizeData {
  url: string;
  nextLink: string;
  pageElement: string;
  exampleUrl?: string;
  insertBefore?: string;
}

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

  async getAutoPagerizeItems(): Promise<DatabaseItem<AutoPagerizeData>[]> {
    return this._upfetch('/databases/AutoPagerize/items_all.json');
  }
}
