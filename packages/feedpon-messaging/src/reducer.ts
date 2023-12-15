import type { State, Event } from './index';

import backend from './backend/reducer';
import categories from './categories/reducer';
import { combineReducers } from 'feedpon-flux';
import histories from './histories/reducer';
import instantNotifications from './instantNotifications/reducer';
import keyMappings from './keyMappings/reducer';
import notifications from './notifications/reducer';
import search from './search/reducer';
import sharedSiteinfo from './sharedSiteinfo/reducer';
import streams from './streams/reducer';
import subscriptions from './subscriptions/reducer';
import trackingUrls from './trackingUrls/reducer';
import ui from './ui/reducer';
import urlReplacements from './urlReplacements/reducer';
import user from './user/reducer';
import userSiteinfo from './userSiteinfo/reducer';
import version from './versionReducer';

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
  urlReplacements,
  user,
  userSiteinfo,
  version,
});
