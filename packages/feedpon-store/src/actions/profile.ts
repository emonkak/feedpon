import type { AppAction } from '../action.ts';
import { acquireCredential } from './auth.ts';

export function reloadProfile(): AppAction<void> {
  return (context) => {
    const { feedlyClient, state$ } = context;

    return state$.mutate(async (state) => {
      const credential = await acquireCredential()(context);

      state.profileLoading = true;

      try {
        state.profile = await feedlyClient.getProfile(credential.accessToken);
      } finally {
        state.profileLoading = false;
      }
    });
  };
}
