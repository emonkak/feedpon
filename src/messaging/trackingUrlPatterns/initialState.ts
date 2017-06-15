import { TrackingUrlPatterns } from 'messaging/types';

const trackingUrlPatterns: TrackingUrlPatterns = {
    items: [
        '^http://feedproxy\\.google\\.com/',
        '^http://rss\\.rssad\\.jp/',
        '^https://rdsig\\.yahoo\\.co\\.jp/rss/'
    ],
    version: 1
};

export default trackingUrlPatterns;
