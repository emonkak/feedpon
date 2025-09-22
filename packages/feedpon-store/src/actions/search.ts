import type { AppAction } from '../action.ts';
import { acquireCredential } from './auth.ts';

export function searchFeeds(query: string): AppAction<Promise<void>> {
  return (context) => {
    const { state$, feedlyClient } = context;

    return state$.mutate(async (state) => {
      state.searching = true;

      try {
        const credential = await acquireCredential()(context);

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
