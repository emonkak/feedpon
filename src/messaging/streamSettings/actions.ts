import { AsyncEvent, StreamSetting } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';

export function changeDefaultStreamSetting(setting: StreamSetting): AsyncEvent {
    return async ({ dispatch }) => {
        dispatch({
            type: 'DEFAULT_STREAM_SETTING_CHANGED',
            setting
        });

        dispatch(sendNotification(
            'Stream settings changed',
            'positive'
        ));
    };
}
