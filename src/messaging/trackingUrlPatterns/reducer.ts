import { Event, TrackingUrlPatterns } from 'messaging/types';
import initialState from 'messaging/trackingUrlPatterns/initialState';

export default function reduceTrackingUrlPatterns(settings: TrackingUrlPatterns, event: Event): TrackingUrlPatterns {
    switch (event.type) {
        case 'TRACKING_URL_PATTERN_ADDED':
            return {
                ...settings,
                items: [...new Set([...settings.items, event.pattern])]
            };

        case 'TRACKING_URL_PATTERN_DELETED':
            return {
                ...settings,
                items: settings.items.filter((pattern) => pattern !== event.pattern)
            };

        case 'TRACKING_URL_PATTERNS_RESET':
            return {
                ...settings,
                items: initialState.items
            };

        default:
            return settings;
    }
}

