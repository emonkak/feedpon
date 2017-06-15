import { AsyncEvent, StreamOptions, StreamView } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';

export function changeDefaultStreamOptions(options: StreamOptions): AsyncEvent {
    return async ({ dispatch }) => {
        dispatch({
            type: 'DEFAULT_STREAM_OPTIONS_CHANGED',
            options
        });

        dispatch(sendNotification(
            'Default stream options changed',
            'positive'
        ));
    };
}

export function changeDefaultStreamView(streamView: StreamView): AsyncEvent {
    return async ({ dispatch }) => {
        dispatch({
            type: 'DEFAULT_STREAM_VIEW_CHANGED',
            streamView
        });

        dispatch(sendNotification(
            'Default stream view changed',
            'positive'
        ));
    };
}
