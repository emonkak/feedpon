import { State } from 'messaging/types';

const initialState: State = {
    credential: {
        authorizedAt: null,
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
    settings: {
        defaultEntryOrder: 'newest',
        defaultNumEntries: 20,
        defaultSubscriptionOrder: 'newest',
        defaultStreamView: 'expanded',
        onlyUnreadEntries: true,
        onlyUnreadSubscriptions: true,
        version: 1
    },
    siteinfo: {
        isLoading: false,
        items: [],
        userItems: [],
        lastUpdatedAt: '',
        version: 1
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
        },
        version: 1
    },
    subscriptions: {
        categories: [],
        isLoading: false,
        items: [],
        lastUpdatedAt: null,
        totalUnreadCount: 0,
        version: 1
    }
};

export default initialState;
