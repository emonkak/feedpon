import { getRequest } from '../httpClient';

export interface BookmarkCounts {
  [key: string]: number;
}

export interface GetEntryResponse extends Entry {
  bookmarks?: Bookmark[];
}

export interface Entry {
  count: number;
  bookmarks?: Bookmark[];
  url: string;
  eid: number;
  title: string;
  screenshot: string;
  entry_url: string;
}

export interface Bookmark {
  comment: string;
  timestamp: string;
  user: string;
  tags: string[];
}

const URL_CHUNK_LIMIT = 50;
const URL_LRNGTH_LIMIT = 4096;

export async function getBookmarkCounts(
  urls: string[],
): Promise<BookmarkCounts> {
  const promises = [];

  for (const chunkedUrls of chunkUrls(urls)) {
    const promise = getRequest(
      'https://bookmark.hatenaapis.com',
      '/count/entries',
      {
        url: chunkedUrls,
      },
    ).then<BookmarkCounts>((response) =>
      response.ok
        ? response.json()
        : Promise.reject(new Error(response.url + ': ' + response.statusText)),
    );
    promises.push(promise);
  }

  const results = await Promise.all(promises);
  return Object.assign({}, ...results);
}

export async function getBookmarkEntry(
  url: string,
): Promise<GetEntryResponse | null> {
  const response = await getRequest(
    'https://b.hatena.ne.jp',
    '/entry/jsonlite/',
    {
      url,
    },
  );
  if (!response.ok) {
    return Promise.reject(new Error(response.url + ': ' + response.statusText));
  }
  return response.json();
}

function chunkUrls(urls: string[]): string[][] {
  if (urls.length === 0) {
    return [];
  }

  let currentChunk: string[] = [];
  let urlLength = 0;

  const chunks = [currentChunk];

  for (let i = 0, l = urls.length; i < l; i++) {
    const url = urls[i]!;

    if (
      currentChunk.length >= URL_CHUNK_LIMIT ||
      urlLength + url.length > URL_LRNGTH_LIMIT
    ) {
      currentChunk = [];
      urlLength = 0;
      chunks.push(currentChunk);
    }

    currentChunk.push(url);
    urlLength += url.length;
  }

  return chunks;
}
