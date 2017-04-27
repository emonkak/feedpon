import { Siteinfo, SyncEvent } from 'messaging/types';

export default function reducer(siteinfo: Siteinfo, event: SyncEvent): Siteinfo {
    switch (event.type) {
        case 'SITEINFO_UPDATED':
            return event.siteinfo;

        default:
            return siteinfo;
    }
}
