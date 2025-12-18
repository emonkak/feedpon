import type { AppAction } from '../index.ts';
import { acquireCredential } from './auth.ts';

export function searchFeeds(query: string): AppAction<Promise<void>> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.mutate(async (state) => {
      state.searching = true;

      try {
        const credential = await dispatch(acquireCredential());

        state.searchResults = (
          await feedlyClient.searchFeeds(credential.accessToken, {
            query,
          })
        ).results;
        state.searchQuery = query;
      } finally {
        state.searching = false;
      }
    });
  };
}
