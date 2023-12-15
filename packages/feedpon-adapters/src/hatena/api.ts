import * as types from './types';
import { getRequest } from '../httpClient';

const URL_CHUNK_LIMIT = 50;
const URL_LRNGTH_LIMIT = 4096;

export async function getBookmarkCounts(
  urls: string[],
): Promise<types.BookmarkCounts> {
  const promises = [];

  for (const chunkedUrls of chunkUrls(urls)) {
    const promise = getRequest(
      'https://bookmark.hatenaapis.com',
      '/count/entries',
      {
        url: chunkedUrls,
      },
    ).then<types.BookmarkCounts>((response) =>
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
): Promise<types.GetEntryResponse | null> {
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
