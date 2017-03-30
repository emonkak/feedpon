import { State } from './types';

const initialState: State = {
    credential: null,
    environment: {
        endpoint: 'https://cloud.feedly.com/',
        clientId: 'feedly',
        clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirectUri: 'https://www.feedly.com/feedly.html'
    },
    feed: null,
    notifications: [],
    subscriptions: {
        categories: [],
        isLoading: false,
        items: [],
        lastUpdatedAt: null
    },
    preference: {
        viewMode: 'expanded'
    }
};

export default initialState;
