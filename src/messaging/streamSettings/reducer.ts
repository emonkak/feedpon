import { StreamSettings, Event } from 'messaging/types';

export default function reduceStreamSettings(settings: StreamSettings, event: Event): StreamSettings {
    switch (event.type) {
        case 'STREAM_SETTINGS_CHANGED':
            return {
                defaultEntryOrder: event.defaultEntryOrder,
                defaultNumEntries: event.defaultNumEntries,
                defaultStreamView: event.defaultStreamView,
                onlyUnreadEntries: event.onlyUnreadEntries,
                version: settings.version
            };

        default:
            return settings;
    }
}

