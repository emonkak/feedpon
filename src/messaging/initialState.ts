import { State } from './types';

const initialState: State = {
    state: 'BOOTING',
    subscriptions: [],
    categories: [],
    unreadCounts: [],
    contents: null,
    credential: null,
    feedly: {
        client_id: 'feedly',
        client_secret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
        scope: 'https://cloud.feedly.com/subscriptions',
        redirect_uri: 'http://www.feedly.com/feedly.html',
    },
};

export default initialState;
