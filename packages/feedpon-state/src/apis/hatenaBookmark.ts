import { type UpFetch, up } from 'up-fetch';
import * as v from 'valibot';

export const Bookmark = v.object({
  user: v.string(),
  tags: v.array(v.string()),
  timestamp: v.pipe(v.string(), v.isoDateTime()),
  comment: v.string(),
});

export const BookmarkEntry = v.object({
  title: v.string(),
  count: v.number(),
  url: v.pipe(v.string(), v.url()),
  entry_url: v.pipe(v.string(), v.url()),
  screenshot: v.pipe(v.string(), v.url()),
  eid: v.number(),
  bookmarks: v.optional(v.array(Bookmark)),
});

interface GetMultipleBookmarkCountsRequest {
  url: string[];
}

const GetMultipleBookmarkCountsResponse = v.map(v.string(), v.number());

interface GetBookmarkEntryRequest {
  uri: string;
}

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
      method: 'GET',
      params,
      schema: GetMultipleBookmarkCountsResponse,
    });
  }

  async getBookmarkEntry(
    params: GetBookmarkEntryRequest,
  ): Promise<v.InferOutput<typeof BookmarkEntry>> {
    return this._upfetch('/entry/jsonlite/', {
      method: 'GET',
      params,
      schema: BookmarkEntry,
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
