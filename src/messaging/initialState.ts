import { State } from 'messaging/types';

const initialState: State = {
    credential: null,
    environment: {
        clientId: 'feedly',
        clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'https://www.feedly.com/feedly.html'
    },
    stream: {
        streamId: null,
        title: 'Loading...',
        entries: [],
        continuation: null,
        unreadCount: 0,
        isLoading: false,
        isLoaded: false,
        feed: null,
        subscription: null,
        options: {
            numEntries: 20,
            onlyUnread: true,
            order: 'newest',
            view: 'expanded'
        }
    },
    notifications: [],
    subscriptions: {
        categories: [],
        isLoading: false,
        items: [],
        lastUpdatedAt: null,
        totalUnreadCount: 0
    },
    preference: {
        defaultEntryOrder: 'newest',
        defaultNumEntries: 20,
        defaultSubscriptionsOrder: 'newest',
        defaultStreamView: 'expanded',
        onlyUnreadEntries: true,
        onlyUnreadSubscriptions: true,
    },
    siteinfo: {
        items: [],
        lastUpdatedAt: ''
    }
};

export default initialState;
