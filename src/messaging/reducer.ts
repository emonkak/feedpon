import { State, Event } from 'messaging/types';

import combineReducers from 'utils/flux/combineReducers';
import credentialReducer from 'messaging/credential/reducer';
import identityFunction from 'utils/identityFunction';
import notificationsReducer from 'messaging/notifications/reducer';
import searchReducer from 'messaging/search/reducer';
import siteinfoReducer from 'messaging/siteinfo/reducer';
import streamSettingsReducer from 'messaging/streamSettings/reducer';
import streamsReducer from 'messaging/streams/reducer';
import subscriptionsReducer from 'messaging/subscriptions/reducer';
import trackingUrlSettingsReducer from 'messaging/trackingUrlSettings/reducer';

export default combineReducers<State, Event>({
    credential: credentialReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    siteinfo: siteinfoReducer,
    streamSettings: streamSettingsReducer,
    streams: streamsReducer,
    subscriptions: subscriptionsReducer,
    trackingUrlSettings: trackingUrlSettingsReducer,
    version: identityFunction
});
