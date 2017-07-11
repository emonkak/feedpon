import backend from 'messaging/backend/initialState';
import categories from 'messaging/categories/initialState';
import histories from 'messaging/histories/initialState';
import instantNotifications from 'messaging/instantNotifications/initialState';
import keyMappings from 'messaging/keyMappings/initialState';
import notifications from 'messaging/notifications/initialState';
import search from 'messaging/search/initialState';
import sharedSiteinfo from 'messaging/sharedSiteinfo/initialState';
import streams from 'messaging/streams/initialState';
import subscriptions from 'messaging/subscriptions/initialState';
import trackingUrls from 'messaging/trackingUrls/initialState';
import ui from 'messaging/ui/initialState';
import user from 'messaging/user/initialState';
import userSiteinfo from 'messaging/userSiteinfo/initialState';
import { State } from 'messaging/types';

const initialState: State = {
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
    userSiteinfo
};

export default initialState;
