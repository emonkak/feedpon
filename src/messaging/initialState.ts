import { State } from 'messaging/types';

const initialState: State = {
    categories: [],
    feed: null,
    notifications: [],
    subscriptions: [],
    preference: {
        viewMode: 'expanded'
    }
};

export default initialState;
