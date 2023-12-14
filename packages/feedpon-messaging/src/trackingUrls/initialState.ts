import * as CacheMap from 'feedpon-utils/containers/CacheMap';
import type { TrackingUrls } from '../index';

const trackingUrls: TrackingUrls = {
    items: CacheMap.empty(1000),
    patterns: [
        '^http://feedproxy\\.google\\.com/',
        '^http://rss\\.rssad\\.jp/',
        '^https://rdsig\\.yahoo\\.co\\.jp/rss/',
        '^http://cgi\\.itmedia\\.co\\.jp/rss/'
    ],
    version: 1
};

export default trackingUrls;
