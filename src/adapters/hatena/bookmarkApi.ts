import * as types from './types';
import toQueryString from 'utils/toQueryString';

export function getBookmarkCounts(urls: string[]): Promise<types.BookmarkCounts> {
    const requestUrl =  'http://api.b.st-hatena.com/entry.counts?'
        + toQueryString({ url: urls });

    return fetch(requestUrl)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<types.BookmarkCounts>(response => response.json());
}

export function getBookmarkEntry(url: string): Promise<types.GetEntryResponse | null> {
    const requestUrl = 'http://b.hatena.ne.jp/entry/jsonlite/?'
        + toQueryString({ url });

    return fetch(requestUrl)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<types.GetEntryResponse>(response => response.json());
}
