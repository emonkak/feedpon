import { State, Event } from 'messaging/types';

import backend from 'messaging/backend/reducer';
import categories from 'messaging/categories/reducer';
import combineReducers from 'utils/flux/combineReducers';
import histories from 'messaging/histories/reducer';
import identityFunction from 'utils/identityFunction';
import instantNotifications from 'messaging/instantNotifications/reducer';
import keyMappings from 'messaging/keyMappings/reducer';
import notifications from 'messaging/notifications/reducer';
import search from 'messaging/search/reducer';
import sharedSiteinfo from 'messaging/sharedSiteinfo/reducer';
import streams from 'messaging/streams/reducer';
import subscriptions from 'messaging/subscriptions/reducer';
import trackingUrls from 'messaging/trackingUrls/reducer';
import ui from 'messaging/ui/reducer';
import user from 'messaging/user/reducer';
import userSiteinfo from 'messaging/userSiteinfo/reducer';

export default combineReducers<State, Event>({
    backend,
    categories,
    histories,
    instantNotifications,
    keyMappings,
    notifications,
    search,
    sharedSiteinfo,
    streams,
    subscriptions,
    trackingUrls,
    ui,
    user,
    userSiteinfo,
    version: identityFunction
});
