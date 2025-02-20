import backend from './backend/initialState.ts';
import categories from './categories/initialState.ts';
import histories from './histories/initialState.ts';
import keyMappings from './keyMappings/initialState.ts';
import notifications from './notifications/initialState.ts';
import osd from './osd/initialState.ts';
import search from './search/initialState.ts';
import sharedSiteinfo from './sharedSiteinfo/initialState.ts';
import streams from './streams/initialState.ts';
import subscriptions from './subscriptions/initialState.ts';
import trackingUrls from './trackingUrls/initialState.ts';
import type { State } from './types.ts';
import ui from './ui/initialState.ts';
import urlReplacements from './urlReplacements/initialState.ts';
import user from './user/initialState.ts';
import userSiteinfo from './userSiteinfo/initialState.ts';

export const initialState: State = {
  backend,
  categories,
  histories,
  osd,
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
  version: '0.0.0',
};
