import * as CacheMap from 'utils/containers/CacheMap';
import { AsyncThunk, Event, Thunk } from 'messaging/types';
import { sendNotification } from 'messaging/notifications/actions';

export function expandUrl(url: string): AsyncThunk<{ originalUrl: string, expandedUrl: string }> {
    return async ({ getState, dispatch }) => {
        const { trackingUrls } = getState();

        const cachedUrl = CacheMap.get(trackingUrls.items, url);
        if (cachedUrl) {
            return { originalUrl: url, expandedUrl: cachedUrl };
        }

        const response = await fetch(url, {
            method: 'HEAD'
        });

        const expandedUrl = response.url;

        dispatch({
            type: 'TRACKING_URL_CACHED',
            originalUrl: url,
            expandedUrl
        });

        return { originalUrl: url, expandedUrl };
    };
}

export function changeTrakingUrlCacheCapacity(capacity: number): Thunk {
    return ({ dispatch }) => {
        dispatch({
            type: 'TRACKING_URL_CACHE_CAPACITY_CHANGED',
            capacity
        });

        dispatch(sendNotification(
            'Tracking URL cache capacity changed',
            'positive'
        ));
    };
}

export function addTrackingUrlPattern(pattern: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'TRACKING_URL_PATTERN_ADDED',
            pattern
        });

        dispatch(sendNotification(
            'Tracking URL pattern added',
            'positive'
        ));
    };
}

export function deleteTrackingUrlPattern(pattern: string): Event {
    return {
        type: 'TRACKING_URL_PATTERN_DELETED',
        pattern
    };
}

export function resetTrackingUrlPatterns(): Event {
    return {
        type: 'TRACKING_URL_PATTERNS_RESET'
    };
}
