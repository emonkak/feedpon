import * as types from './types';
import buildQueryString from 'utils/buildQueryString';

const URL_CHUNK_LIMIT = 50;
const URL_LRNGTH_LIMIT = 4096;

export function getBookmarkCounts(urls: string[]): Promise<types.BookmarkCounts> {
    const promises = [];

    for (const chunkedUrls of chunkUrls(urls)) {
        const requestUrl =  'http://api.b.st-hatena.com/entry.counts?'
            + buildQueryString({ url: chunkedUrls });

        const promise = fetch(requestUrl)
            .then<Response>((response) => response.ok ? response : Promise.reject(response.url + ': ' + response.statusText))
            .then<types.BookmarkCounts>((response) => response.json());

        promises.push(promise);
    }

    return Promise.all(promises)
        .then((results) => Object.assign({}, ...results));
}

export function getBookmarkEntry(url: string): Promise<types.GetEntryResponse | null> {
    const requestUrl = 'http://b.hatena.ne.jp/entry/jsonlite/?'
        + buildQueryString({ url });

    return fetch(requestUrl)
        .then<Response>((response) => response.ok ? response : Promise.reject(response.url + ': ' + response.statusText))
        .then<types.GetEntryResponse>((response) => response.json());
}

function chunkUrls(urls: string[]): string[][] {
    if (urls.length === 0) {
        return [];
    }

    let currentChunk: string[] = [];
    let urlLength = 0;

    const chunks = [currentChunk];

    for (let i = 0, l = urls.length; i < l; i++) {
        const url = urls[i];

        if (currentChunk.length >= URL_CHUNK_LIMIT
            || urlLength + url.length > URL_LRNGTH_LIMIT) {
            currentChunk = [];
            urlLength = 0;
            chunks.push(currentChunk);
        }

        currentChunk.push(url);
        urlLength += url.length;
    }

    return chunks;
}
