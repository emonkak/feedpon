import type { AppAction } from '../index.ts';
import { acquireCredential } from './auth.ts';

export function searchFeeds(query: string): AppAction<Promise<void>> {
  return async (state$, { feedlyClient }, dispatch) => {
    const searchQuery$ = state$.get('searchQuery');
    const searchResults$ = state$.get('searchResults');
    const searching$ = state$.get('searching');

    searching$.value = true;

    try {
      const credential = await dispatch(acquireCredential());

      searchResults$.value = (
        await feedlyClient.searchFeeds(credential.accessToken, {
          query,
        })
      ).results;
      searchQuery$.value = query;
    } finally {
      searching$.value = false;
    }
  };
}
