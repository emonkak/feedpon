import type { SiteinfoItem, Event } from '../index';

export function addUserSiteinfoItem(item: SiteinfoItem): Event {
  return {
    type: 'USER_SITEINFO_ITEM_ADDED',
    item,
  };
}

export function deleteUserSiteinfoItem(id: string | number): Event {
  return {
    type: 'USER_SITEINFO_ITEM_DELETED',
    id,
  };
}

export function updateUserSiteinfoItem(item: SiteinfoItem): Event {
  return {
    type: 'USER_SITEINFO_ITEM_UPDATED',
    item,
  };
}
