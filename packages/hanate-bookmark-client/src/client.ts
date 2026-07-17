import { type UpFetch, up } from 'up-fetch';
import * as v from 'valibot';
import {
  Entry,
  type GetEntryRequest,
  type GetMultipleBookmarkCountsRequest,
  GetMultipleBookmarkCountsResponse,
} from './schema.ts';

export interface HatenaBookmarkClientOptions {
  fetch?: typeof fetch;
}

export class HatenaBookmarkClient {
  private _upfetch: UpFetch;

  constructor(options: HatenaBookmarkClientOptions = {}) {
    this._upfetch = up(options.fetch ?? fetch, () => ({
      baseUrl: 'https://bookmark.hatenaapis.com',
      serializeParams,
    }));
  }

  async getMultipleBookmarkCounts(
    params: GetMultipleBookmarkCountsRequest,
  ): Promise<v.InferOutput<typeof GetMultipleBookmarkCountsResponse>> {
    return this._upfetch('/count/entries', {
      baseUrl: 'https://bookmark.hatenaapis.com',
      method: 'GET',
      params,
      schema: GetMultipleBookmarkCountsResponse,
    });
  }

  async getEntry(
    params: GetEntryRequest,
  ): Promise<v.InferOutput<typeof Entry> | null> {
    return this._upfetch('https://b.hatena.ne.jp/entry/jsonlite/', {
      baseUrl: 'https://b.hatena.ne.jp',
      method: 'GET',
      params,
      schema: v.nullable(Entry),
    });
  }
}

function serializeParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const key of Object.keys(params)) {
    const param = params[key];
    if (Array.isArray(param)) {
      for (let i = 0, l = param.length; i < l; i++) {
        searchParams.append(key, param[i]!);
      }
    } else {
      searchParams.append(key, param as string);
    }
  }

  return searchParams.toString();
}
