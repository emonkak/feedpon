import * as feedlyApi from 'adapters/feedly/api';
import { AsyncEvent } from 'messaging/types';
import { getFeedlyToken } from 'messaging/credential/actions';

export function fetchUser(): AsyncEvent {
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

