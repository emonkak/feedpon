import { Event } from 'messaging/types';

export function addTrackingUrlPattern(pattern: string): Event {
    return {
        type: 'TRACKING_URL_PATTERN_ADDED',
        pattern
    };
}

export function removeTrackingUrlPattern(pattern: string): Event {
    return {
        type: 'TRACKING_URL_PATTERN_REMOVED',
        pattern
    };
}
