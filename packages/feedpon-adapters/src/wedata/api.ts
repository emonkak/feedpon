import * as types from './types';
import { getRequest } from '../httpClient';

const ENDPOINT = 'http://wedata.net/';

export async function getItems<T>(
  databaseName: string,
): Promise<types.WedataItem<T>[]> {
  const response = await getRequest(
    ENDPOINT,
    '/databases/' + databaseName + '/items_all.json',
  );
  if (!response.ok) {
    return Promise.reject(response.url + ': ' + response.statusText);
  }
  return response.json();
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
