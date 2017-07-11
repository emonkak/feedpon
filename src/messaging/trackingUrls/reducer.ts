import * as CacheMap  from 'utils/containers/CacheMap';
import initialState from 'messaging/trackingUrls/initialState';
import { Event, TrackingUrls } from 'messaging/types';

export default function reduceTrackingUrlPatterns(trackingUrls: TrackingUrls, event: Event): TrackingUrls {
    switch (event.type) {
        case 'TRACKING_URL_CACHED':
            return {
                ...trackingUrls,
                items: CacheMap.update(trackingUrls.items, event.originalUrl, event.expandedUrl)
            };

        case 'TRACKING_URL_CACHE_CAPACITY_CHANGED':
            return {
                ...trackingUrls,
                items: CacheMap.extend(trackingUrls.items, event.capacity)
            };

        case 'TRACKING_URL_PATTERN_ADDED':
            return {
                ...trackingUrls,
                patterns: [...new Set([...trackingUrls.patterns, event.pattern])]
            };

        case 'TRACKING_URL_PATTERN_DELETED':
            return {
                ...trackingUrls,
                patterns: trackingUrls.patterns.filter((pattern) => pattern !== event.pattern)
            };

        case 'TRACKING_URL_PATTERNS_RESET':
            return {
                ...trackingUrls,
                patterns: initialState.patterns
            };

        default:
            return trackingUrls;
    }
}

