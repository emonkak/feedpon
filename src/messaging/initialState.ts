import { State } from 'messaging/types';

const initialState: State = {
    credential: null,
    search: {
        feeds: [],
        isLoading: false,
        isLoaded: false,
        query: ''
    },
    environment: {
        clientId: 'feedly',
        clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'https://www.feedly.com/feedly.html'
    },
    notifications: [],
    settings: {
        defaultEntryOrder: 'newest',
        defaultNumEntries: 20,
        defaultSubscriptionOrder: 'newest',
        defaultStreamView: 'expanded',
        onlyUnreadEntries: true,
        onlyUnreadSubscriptions: true
    },
    siteinfo: {
        isLoading: false,
        items: [],
        userItems: [],
        lastUpdatedAt: ''
    },
    stream: {
        streamId: null,
        title: 'Loading...',
        entries: [],
        continuation: null,
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
    subscriptions: {
        categories: [],
        isLoading: false,
        items: [],
        lastUpdatedAt: null,
        totalUnreadCount: 0
    }
};

export default initialState;
