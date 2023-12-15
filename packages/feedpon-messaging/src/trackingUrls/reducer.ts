import * as CacheMap from 'feedpon-utils/CacheMap';
import type { Event, TrackingUrls } from '../index';
import initialState from './initialState';

export default function reduceTrackingUrlPatterns(
  trackingUrls: TrackingUrls,
  event: Event,
): TrackingUrls {
  switch (event.type) {
    case 'TRACKING_URL_EXPANDED':
      return {
        ...trackingUrls,
        items: CacheMap.set(
          trackingUrls.items,
          event.originalUrl,
          event.expandedUrl,
        ),
      };

    case 'TRACKING_URL_CACHE_CAPACITY_CHANGED':
      return {
        ...trackingUrls,
        items: CacheMap.extend(trackingUrls.items, event.capacity),
      };

    case 'TRACKING_URL_PATTERN_ADDED':
      return {
        ...trackingUrls,
        patterns: Array.from([...trackingUrls.patterns, event.pattern]),
      };

    case 'TRACKING_URL_PATTERN_DELETED':
      return {
        ...trackingUrls,
        patterns: trackingUrls.patterns.filter(
          (pattern) => pattern !== event.pattern,
        ),
      };

    case 'TRACKING_URL_PATTERNS_RESET':
      return {
        ...trackingUrls,
        patterns: initialState.patterns,
      };

    default:
      return trackingUrls;
  }
}
