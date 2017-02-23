import { State } from 'messaging/types';

const initialState: State = {
    entries: [],
    feed: null,
    notifications: [],
    subscriptions: [],
    viewMode: 'full',
};

export default initialState;
