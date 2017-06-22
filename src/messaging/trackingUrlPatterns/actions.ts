import { AsyncThunk, Event } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';

export function addTrackingUrlPattern(pattern: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'TRACKING_URL_PATTERN_ADDED',
            pattern
        });

        dispatch(sendNotification(
            'Tracking URL pattern added',
            'positive'
        ));
    };
}

export function removeTrackingUrlPattern(pattern: string): Event {
    return {
        type: 'TRACKING_URL_PATTERN_REMOVED',
        pattern
    };
}
