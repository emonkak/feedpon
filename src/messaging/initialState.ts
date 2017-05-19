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
        lastUpdatedAt: null,
        version: 1
    },
    streams: {
        current: {
            streamId: null,
            title: 'Loading...',
            entries: [],
            continuation: null,
            feed: null,
            subscription: null,
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
        categories: {
            isCreating: false,
            items: []
        },
        isLoading: false,
        items: [],
        lastUpdatedAt: null,
        totalUnreadCount: 0,
        version: 1
    }
};

export default initialState;
