import { EntryOrder, AsyncEvent, StreamView } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';

export function changeStreamSettings(
    defaultEntryOrder: EntryOrder,
    defaultNumEntries: number,
    defaultStreamView: StreamView,
    onlyUnreadEntries: boolean
): AsyncEvent {
    return async ({ dispatch }) => {
        dispatch({
            type: 'STREAM_SETTINGS_CHANGED',
            defaultEntryOrder,
            defaultNumEntries,
            defaultStreamView,
            onlyUnreadEntries
        });

        dispatch(sendNotification(
            'Stream settings changed',
            'positive'
        ));
    };
}
