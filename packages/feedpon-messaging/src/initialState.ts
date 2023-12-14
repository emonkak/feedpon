import backend from './backend/initialState';
import categories from './categories/initialState';
import histories from './histories/initialState';
import instantNotifications from './instantNotifications/initialState';
import keyMappings from './keyMappings/initialState';
import notifications from './notifications/initialState';
import search from './search/initialState';
import sharedSiteinfo from './sharedSiteinfo/initialState';
import streams from './streams/initialState';
import subscriptions from './subscriptions/initialState';
import trackingUrls from './trackingUrls/initialState';
import ui from './ui/initialState';
import urlReplacements from './urlReplacements/initialState';
import user from './user/initialState';
import userSiteinfo from './userSiteinfo/initialState';
import { State } from './index';

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
  urlReplacements,
  user,
  userSiteinfo,
  version: '0.0.0',
};

export default initialState;
