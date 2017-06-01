import { Event, TrackingUrlSettings } from 'messaging/types';

export default function reduceTrackingUrlSettings(settings: TrackingUrlSettings, event: Event): TrackingUrlSettings {
    switch (event.type) {
        case 'TRACKING_URL_PATTERN_ADDED':
            return {
                patterns: [...new Set([...settings.patterns, event.pattern])],
                version: settings.version
            };

        case 'TRACKING_URL_PATTERN_REMOVED':
            return {
                patterns: settings.patterns.filter((pattern) => pattern !== event.pattern),
                version: settings.version
            };

        default:
            return settings;
    }
}

