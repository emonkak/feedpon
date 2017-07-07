import { UserSiteinfo, Event } from 'messaging/types';

export default function reducer(siteinfo: UserSiteinfo, event: Event): UserSiteinfo {
    switch (event.type) {
        case 'USER_SITEINFO_ITEM_ADDED':
            return {
                ...siteinfo,
                items: [...siteinfo.items, event.item]
            };

        case 'USER_SITEINFO_ITEM_UPDATED':
            return {
                ...siteinfo,
                items: siteinfo.items
                    .map((item) => item.id === event.item.id ? event.item : item)
            };

        case 'USER_SITEINFO_ITEM_DELETED':
            return {
                ...siteinfo,
                items: siteinfo.items.filter((item) => item.id !== event.id)
            };

        default:
            return siteinfo;
    }
}
