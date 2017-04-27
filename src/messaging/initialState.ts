import { State } from 'messaging/types';

const initialState: State = {
    credential: null,
    environment: {
        clientId: 'feedly',
        clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'https://www.feedly.com/feedly.html'
    },
    feed: {
        feedId: null,
        title: 'Loading...',
        description: '',
        url: '',
        entries: [],
        subscribers: 0,
        velocity: 0,
        continuation: null,
        isLoading: false,
        isLoaded: false,
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
        lastUpdatedAt: null
    },
    preference: {
        defaultEntryOrder: 'newest',
        defaultNumEntries: 20,
        defaultSubscriptionsOrder: 'newest',
        defaultFeedView: 'expanded',
        onlyUnreadEntries: true,
        onlyUnreadSubscriptions: true,
    },
    siteinfo: {
        items: [],
        lastUpdatedAt: ''
    }
};

export default initialState;
