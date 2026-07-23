import type { AppAction } from '../index.ts';
import { acquireCredential } from './auth.ts';

export function reloadProfile(): AppAction<void> {
  return async (state$, { feedlyClient }, dispatch) => {
    const profile$ = state$.get('profile');
    const profileLoading$ = state$.get('profileLoading');

    const credential = await dispatch(acquireCredential());

    profileLoading$.value = true;

    try {
      profile$.value = await feedlyClient.getProfile(credential.accessToken);
    } finally {
      profileLoading$.value = false;
    }
  };
}
