import { Event } from 'messaging/types';

export default function versionReducer(version: string, event: Event): string {
    if (event.type === 'APPLICATION_INITIALIZED') {
        return event.version;
    }
    return version;
}
