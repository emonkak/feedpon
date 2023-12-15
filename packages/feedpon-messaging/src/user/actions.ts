import * as feedly from 'feedpon-adapters/feedly';
import type { AsyncThunk } from '../index';
import { getFeedlyToken } from '../backend/actions';

export function fetchUser(): AsyncThunk {
  return async ({ dispatch }, { environment }) => {
    dispatch({
      type: 'USER_FETCHING',
    });

    try {
      const token = await dispatch(getFeedlyToken());

      const profile = await feedly.getProfile(
        environment.endPoint,
        token.access_token,
      );

      const userName =
        (profile.twitter ? '@' + profile.twitter : '') ||
        profile.email ||
        profile.fullName ||
        profile.id ||
        '<unknown>';

      dispatch({
        type: 'USER_FETCHED',
        profile: {
          userName,
          picture: profile.picture || '',
          source: 'Feedly',
        },
      });
    } catch (error) {
      dispatch({
        type: 'USER_FETCHING_FAILED',
      });

      throw error;
    }
  };
}
