import { Siteinfo, Event } from 'messaging/types';

export default function reducer(siteinfo: Siteinfo, event: Event): Siteinfo {
    switch (event.type) {
        case 'SITEINFO_UPDATING':
            return {
                ...siteinfo,
                isLoading: true
            };

        case 'SITEINFO_UPDATED':
            return {
                ...siteinfo,
                items: event.items,
                lastUpdatedAt: event.updatedAt,
                isLoading: false
            };

        case 'USER_SITEINFO_ITEM_ADDED':
            return {
                ...siteinfo,
                userItems: siteinfo.userItems.concat([event.item])
            };

        case 'USER_SITEINFO_ITEM_REMOVED':
            return {
                ...siteinfo,
                userItems: siteinfo.userItems.filter((item) => item.id !== event.id)
            };

        default:
            return siteinfo;
    }
}
