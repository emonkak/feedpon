import { State } from 'messaging/types';

const initialState: State = {
    categories: [],
    feed: null,
    notifications: [],
    subscriptions: {
        isLoading: false,
        lastUpdatedAt: null,
        items: []
    },
    preference: {
        viewMode: 'expanded'
    }
};

export default initialState;
