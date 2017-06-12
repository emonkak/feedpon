import { TrackingUrlSettings } from 'messaging/types';

const trackingUrlSettings: TrackingUrlSettings = {
    patterns: [
        '^http://feedproxy\\.google\\.com/',
        '^http://rss\\.rssad\\.jp/',
        '^https://rdsig\\.yahoo\\.co\\.jp/rss/'
    ],
    version: 1
};

export default trackingUrlSettings;
