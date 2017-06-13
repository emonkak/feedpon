import { StreamSettings, Event } from 'messaging/types';

export default function reduceStreamSettings(settings: StreamSettings, event: Event): StreamSettings {
    switch (event.type) {
        case 'DEFAULT_STREAM_SETTING_CHANGED':
            return {
                defaultSetting: event.setting,
                version: settings.version
            };

        default:
            return settings;
    }
}
