import { Event, TrackingUrlSettings } from 'messaging/types';

export default function reduceTrackingUrlSettings(settings: TrackingUrlSettings, event: Event): TrackingUrlSettings {
    switch (event.type) {
        case 'TRACKING_URL_PATTERN_ADDED':
            return {
                ...settings,
                patterns: [...new Set([...settings.patterns, event.pattern])]
            };

        case 'TRACKING_URL_PATTERN_REMOVED':
            return {
                ...settings,
                patterns: settings.patterns.filter((pattern) => pattern !== event.pattern)
            };

        default:
            return settings;
    }
}

