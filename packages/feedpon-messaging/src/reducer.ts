import { combineReducers } from 'feedpon-flux';
import backend from './backend/reducer.ts';
import categories from './categories/reducer.ts';
import histories from './histories/reducer.ts';
import keyMappings from './keyMappings/reducer.ts';
import notifications from './notifications/reducer.ts';
import osd from './osd/reducer.ts';
import search from './search/reducer.ts';
import sharedSiteinfo from './sharedSiteinfo/reducer.ts';
import streams from './streams/reducer.ts';
import subscriptions from './subscriptions/reducer.ts';
import trackingUrls from './trackingUrls/reducer.ts';
import type { Event, State } from './types.ts';
import ui from './ui/reducer.ts';
import urlReplacements from './urlReplacements/reducer.ts';
import user from './user/reducer.ts';
import userSiteinfo from './userSiteinfo/reducer.ts';
import version from './versionReducer.ts';

export default combineReducers<State, Event>({
  backend,
  categories,
  histories,
  keyMappings,
  notifications,
  osd,
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
