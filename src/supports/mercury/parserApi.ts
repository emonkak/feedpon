import querystring from 'querystring';

import * as types from './types';

export default function parserApi(apiKey: string, url: string): Promise<types.Article | null> {
    const requestUrl =  'https://mercury.postlight.com/parser?' + querystring.stringify({ url });

    const request = new Request(requestUrl, {
        method: 'GET',
        headers: { 'x-api-key': apiKey }
    });

    return fetch(request)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<types.Article>(response => response.json());
}
