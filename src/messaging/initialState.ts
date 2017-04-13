import { State } from './types';

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
        subscription: null
    },
    notifications: [],
    subscriptions: {
        categories: [],
        isLoading: false,
        items: [],
        lastUpdatedAt: null
    },
    preference: {
        viewMode: 'expanded'
    },
    siteinfo: {
        items: [],
        lastUpdatedAt: ''
    }
};

export default initialState;
