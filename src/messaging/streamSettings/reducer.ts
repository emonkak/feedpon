import { StreamSettings, Event } from 'messaging/types';

export default function reduceStreamSettings(settings: StreamSettings, event: Event): StreamSettings {
    switch (event.type) {
        case 'DEFAULT_STREAM_OPTIONS_CHANGED':
            return {
                ...settings,
                defaultOptions: event.options
            };

        case 'DEFAULT_STREAM_VIEW_CHANGED':
            return {
                ...settings,
                defaultStreamView: event.streamView
            };

        default:
            return settings;
    }
}
