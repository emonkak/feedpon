import { AsyncEvent, SiteinfoItem, Event } from 'messaging/types';
import { LDRFullFeedData, WedataItem }  from 'adapters/wedata/types';
import { getAutoPagerizeItems, getLDRFullFeedItems }  from 'adapters/wedata/api';
import { sendNotification } from 'messaging/notification/actions';

const LDR_FULL_FEED_TYPE_PRIORITIES: { [key: string]: number } = {
    'SBM': 3,
    'IND': 2,
    'INDIVIDUAL': 2,
    'SUB': 1,
    'SUBGENERAL': 1,
    'GEN': 0,
    'GENERAL': 0
};

export function addSiteinfoItem(item: SiteinfoItem): Event {
    return {
        type: 'USER_SITEINFO_ITEM_ADDED',
        item
    };
}

export function removeSiteinfoItem(id: string): Event {
    return {
        type: 'USER_SITEINFO_ITEM_REMOVED',
        id
    };
}

export function updateSiteinfo(): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'SITEINFO_UPDATING'
        });

        const [autoPagerizeItems, ldrFullFeedItems] = await Promise.all([
            getAutoPagerizeItems(),
            getLDRFullFeedItems()
        ]);

        const primaryItems = autoPagerizeItems
            .slice(0, -1)  // Remove the generic rule
            .map((item) => ({
                id: item.resource_url,
                name: item.name,
                urlPattern: item.data.url,
                contentPath: item.data.pageElement,
                nextLinkPath: item.data.nextLink
            }));
        const secondaryItems = ldrFullFeedItems
            .sort(compareLdrFullFeedItem)
            .map((item) => ({
                id: item.resource_url,
                name: item.name,
                urlPattern: item.data.url,
                contentPath: item.data.xpath,
                nextLinkPath: ''
            }));

        dispatch({
            type: 'SITEINFO_UPDATED',
            items: primaryItems.concat(secondaryItems),
            updatedAt: new Date().toISOString()
        });

        dispatch(sendNotification(
            'Siteinfo Updated',
            'positive'
        ));
    };
}

function compareLdrFullFeedItem(x: WedataItem<LDRFullFeedData>, y: WedataItem<LDRFullFeedData>): number {
    const p1 = LDR_FULL_FEED_TYPE_PRIORITIES[x.data.type];
    const p2 = LDR_FULL_FEED_TYPE_PRIORITIES[y.data.type];
    if (p1 === p2) {
        return 0;
    }
    return p1 < p2 ? 1 : -1;
}
