import * as CacheMap from 'utils/containers/CacheMap';
import { TrackingUrls } from 'messaging/types';

const trackingUrls: TrackingUrls = {
    items: CacheMap.empty(1000),
    patterns: [
        '^http://feedproxy\\.google\\.com/',
        '^http://rss\\.rssad\\.jp/',
        '^https://rdsig\\.yahoo\\.co\\.jp/rss/'
    ],
    version: 1
};

export default trackingUrls;
