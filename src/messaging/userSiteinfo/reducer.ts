import { UserSiteinfo, Event } from 'messaging/types';

export default function reducer(siteinfo: UserSiteinfo, event: Event): UserSiteinfo {
    switch (event.type) {
        case 'USER_SITEINFO_ITEM_ADDED':
            return {
                items: [...siteinfo.items, event.item],
                version: siteinfo.version
            };

        case 'USER_SITEINFO_ITEM_UPDATED':
            return {
                items: siteinfo.items
                    .map((item) => item.id === event.item.id ? event.item : item),
                version: siteinfo.version
            };

        case 'USER_SITEINFO_ITEM_REMOVED':
            return {
                items: siteinfo.items.filter((item) => item.id !== event.id),
                version: siteinfo.version
            };

        default:
            return siteinfo;
    }
}
