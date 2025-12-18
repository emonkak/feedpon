import type { AppAction } from '../index.ts';
import { acquireCredential } from './auth.ts';

export function reloadProfile(): AppAction<void> {
  return (state$, { feedlyClient }, dispatch) => {
    return state$.mutate(async (state) => {
      const credential = await dispatch(acquireCredential());

      state.profileLoading = true;

      try {
        state.profile = await feedlyClient.getProfile(credential.accessToken);
      } finally {
        state.profileLoading = false;
      }
    });
  };
}
