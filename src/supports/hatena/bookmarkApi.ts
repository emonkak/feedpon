import querystring from 'querystring';

import * as types from './types';

export function getBookmarkCounts(urls: string[]): Promise<types.BookmarkCounts> {
    const apiUrl =  'http://api.b.st-hatena.com/entry.counts?'
        + querystring.stringify({ url: urls });

    return fetch(apiUrl)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<types.BookmarkCounts>(response => response.json());
}

export function getBookmarkEntry(url: string): Promise<types.GetEntryResponse | null> {
    const apiUrl = 'http://b.hatena.ne.jp/entry/jsonlite/?'
        + querystring.stringify({ url });

    return fetch(apiUrl)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<types.GetEntryResponse>(response => response.json());
}
