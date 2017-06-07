import { State, Event } from 'messaging/types';

import categoriesReducer from 'messaging/categories/reducer';
import combineReducers from 'utils/flux/combineReducers';
import credentialReducer from 'messaging/credential/reducer';
import identityFunction from 'utils/identityFunction';
import notificationsReducer from 'messaging/notifications/reducer';
import searchReducer from 'messaging/search/reducer';
import sharedSiteinfoReducer from 'messaging/sharedSiteinfo/reducer';
import streamSettingsReducer from 'messaging/streamSettings/reducer';
import streamsReducer from 'messaging/streams/reducer';
import subscriptionsReducer from 'messaging/subscriptions/reducer';
import trackingUrlSettingsReducer from 'messaging/trackingUrlSettings/reducer';
import userReducer from 'messaging/user/reducer';
import userSiteinfoReducer from 'messaging/userSiteinfo/reducer';

export default combineReducers<State, Event>({
    categories: categoriesReducer,
    credential: credentialReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    sharedSiteinfo: sharedSiteinfoReducer,
    streamSettings: streamSettingsReducer,
    streams: streamsReducer,
    subscriptions: subscriptionsReducer,
    trackingUrlSettings: trackingUrlSettingsReducer,
    user: userReducer,
    userSiteinfo: userSiteinfoReducer,
    version: identityFunction
});
