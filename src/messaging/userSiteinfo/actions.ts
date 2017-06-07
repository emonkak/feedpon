import { SiteinfoItem, Event } from 'messaging/types';

export function addSiteinfoItem(item: SiteinfoItem): Event {
    return {
        type: 'USER_SITEINFO_ITEM_ADDED',
        item
    };
}

export function removeSiteinfoItem(id: string | number): Event {
    return {
        type: 'USER_SITEINFO_ITEM_REMOVED',
        id
    };
}

export function updateSiteinfoItem(item: SiteinfoItem): Event {
    return {
        type: 'USER_SITEINFO_ITEM_UPDATED',
        item
    };
}
