import { State } from 'messaging/types';

const initialState: State = {
    categories: {
        isLoading: false,
        items: [],
        version: 1
    },
    credential: {
        authorizedAt: 0,
        token: null,
        version: 1
    },
    search: {
        feeds: [],
        isLoaded: false,
        isLoading: false,
        query: '',
        version: 1
    },
    notifications: {
        items: [],
        version: 1
    },
    streamSettings: {
        defaultEntryOrder: 'newest',
        defaultNumEntries: 20,
        defaultStreamView: 'expanded',
        onlyUnreadEntries: true,
        version: 1
    },
    trackingUrlSettings: {
        patterns: [
            '^http://feedproxy\\.google\\.com/',
            '^http://rss\\.rssad\\.jp/',
            '^https://rdsig\\.yahoo\\.co\\.jp/rss/'
        ],
        version: 1
    },
    siteinfo: {
        isLoading: false,
        items: [],
        userItems: [],
        lastUpdatedAt: 0,
        version: 1
    },
    streams: {
        current: {
            streamId: null,
            title: 'Loading...',
            entries: [],
            continuation: null,
            feed: null,
            options: {
                numEntries: 20,
                onlyUnread: true,
                order: 'newest',
                view: 'expanded'
            }
        },
        isLoading: false,
        isLoaded: false,
        version: 1
    },
    subscriptions: {
        isLoading: false,
        items: [],
        lastUpdatedAt: 0,
        onlyUnread: true,
        order: 'title',
        totalUnreadCount: 0,
        version: 1
    },
    version: '0.0.0'
};

export default initialState;
