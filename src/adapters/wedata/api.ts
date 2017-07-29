import * as types from './types';

const ENDPOINT = 'http://wedata.net/';

export function getItems<T>(databaseName: string): Promise<types.WedataItem<T>[]> {
    const requestUrl = ENDPOINT + 'databases/' + databaseName + '/items_all.json';

    return fetch(requestUrl)
        .then<Response>((response) => response.ok ? response : Promise.reject(response.url + ': ' + response.statusText))
        .then<types.WedataItem<T>[]>((response) => response.json());
}

export function getAutoPagerizeItems(): Promise<types.WedataItem<types.AutoPagerizeData>[]> {
    return getItems('AutoPagerize');
}

export function getLDRFullFeedItems(): Promise<types.WedataItem<types.LDRFullFeedData>[]> {
    return getItems('LDRFullFeed');
}
