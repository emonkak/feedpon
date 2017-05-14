import { State, SyncEvent } from 'messaging/types';

import combineReducers from 'utils/flux/combineReducers';
import credentialReducer from 'messaging/credential/reducer';
import notificationsReducer from 'messaging/notification/reducer';
import searchReducer from 'messaging/search/reducer';
import siteinfoReducer from 'messaging/siteinfo/reducer';
import streamReducer from 'messaging/stream/reducer';
import subscriptionsReducer from 'messaging/subscription/reducer';

export default combineReducers<State, SyncEvent>({
    credential: credentialReducer,
    environment: (state, event) => state,
    notifications: notificationsReducer,
    search: searchReducer,
    settings: (state, event) => state,
    siteinfo: siteinfoReducer,
    stream: streamReducer,
    subscriptions: subscriptionsReducer
});
