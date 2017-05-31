import { State, Event } from 'messaging/types';

import combineReducers from 'utils/flux/combineReducers';
import credentialReducer from 'messaging/credential/reducer';
import identityFunction from 'utils/identityFunction';
import notificationsReducer from 'messaging/notification/reducer';
import searchReducer from 'messaging/search/reducer';
import siteinfoReducer from 'messaging/siteinfo/reducer';
import streamsReducer from 'messaging/stream/reducer';
import subscriptionsReducer from 'messaging/subscription/reducer';

export default combineReducers<State, Event>({
    credential: credentialReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    settings: identityFunction,
    siteinfo: siteinfoReducer,
    streams: streamsReducer,
    subscriptions: subscriptionsReducer,
    version: identityFunction
});
