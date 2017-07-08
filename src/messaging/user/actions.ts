import * as feedlyApi from 'adapters/feedly/api';
import { AsyncThunk } from 'messaging/types';
import { getFeedlyToken } from 'messaging/backend/actions';

export function fetchUser(): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'USER_FETCHING'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const profile = await feedlyApi.getProfile(token.access_token);

            const userId = profile.facebookUserId
                        || profile.google
                        || profile.reader
                        || '@' + profile.twitter
                        || profile.windowsLiveId
                        || profile.wordPressId
                        || '<unknown>';

            dispatch({
                type: 'USER_FETCHED',
                profile: {
                    userId,
                    picture: profile.picture || '',
                    source: 'Feedly'
                }
            });
        } catch (error) {
            dispatch({
                type: 'USER_FETCHING_FAILED'
            });

            throw error;
        }
    };
}

