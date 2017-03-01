import { State } from 'messaging/types';

const initialState: State = {
    entries: [],
    feed: null,
    notifications: [],
    subscriptions: [],
    viewType: 'expanded',
};

export default initialState;
