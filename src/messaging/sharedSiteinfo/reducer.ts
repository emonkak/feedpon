import { SharedSiteinfo, Event } from 'messaging/types';

export default function reducer(siteinfo: SharedSiteinfo, event: Event): SharedSiteinfo {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...siteinfo,
                isLoading: false
            };

        case 'SITEINFO_UPDATING':
            return {
                ...siteinfo,
                isLoading: true
            };

        case 'SITEINFO_UPDATING_FAILED':
            return {
                ...siteinfo,
                isLoading: false
            };

        case 'SITEINFO_UPDATED':
            return {
                ...siteinfo,
                items: event.items,
                lastUpdatedAt: event.updatedAt,
                isLoading: false
            };

        default:
            return siteinfo;
    }
}
