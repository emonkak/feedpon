import * as types from './types';
import httpClient from 'feedpon-utils/http/httpClient';

const ENDPOINT = 'http://wedata.net/';

export function getItems<T>(
  databaseName: string,
): Promise<types.WedataItem<T>[]> {
  return httpClient
    .get(ENDPOINT, '/databases/' + databaseName + '/items_all.json')
    .then<types.WedataItem<T>[]>((response) =>
      response.ok
        ? response.json()
        : Promise.reject(response.url + ': ' + response.statusText),
    );
}

export function getAutoPagerizeItems(): Promise<
  types.WedataItem<types.AutoPagerizeData>[]
> {
  return getItems('AutoPagerize');
}

export function getLDRFullFeedItems(): Promise<
  types.WedataItem<types.LDRFullFeedData>[]
> {
  return getItems('LDRFullFeed');
}
