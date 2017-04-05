import querystring from 'querystring';

import * as types from './types';

export function getBookmarkCounts(urls: string[]): Promise<types.BookmarkCounts> {
    const apiUrl =  'http://api.b.st-hatena.com/entry.counts?'
        + querystring.stringify({ url: urls });

    return fetch(apiUrl)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<{ [key: string]: number }>(response => response.json());
}
