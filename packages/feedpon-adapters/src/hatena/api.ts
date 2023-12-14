import * as types from './types';
import httpClient from 'feedpon-utils/http/httpClient';

const URL_CHUNK_LIMIT = 50;
const URL_LRNGTH_LIMIT = 4096;

export function getBookmarkCounts(urls: string[]): Promise<types.BookmarkCounts> {
    const promises = [];

    for (const chunkedUrls of chunkUrls(urls)) {
        const promise = httpClient.get('https://bookmark.hatenaapis.com', '/count/entries', {
            url: chunkedUrls
        })
            .then<types.BookmarkCounts>((response) => response.ok ?
                response.json() :
                Promise.reject(new Error(response.url + ': ' + response.statusText))
            );
        promises.push(promise);
    }

    return Promise.all(promises)
        .then((results) => Object.assign({}, ...results));
}

export function getBookmarkEntry(url: string): Promise<types.GetEntryResponse | null> {
    return httpClient.get('https://b.hatena.ne.jp', '/entry/jsonlite/', {
        url
    })
        .then<types.GetEntryResponse>((response) => response.ok ?
            response.json() :
            Promise.reject(new Error(response.url + ': ' + response.statusText))
        );
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
