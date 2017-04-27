import { AsyncEvent } from 'messaging/types';
import { LDRFullFeedData, WedataItem }  from 'adapters/wedata/types';
import { getAutoPagerizeItems, getLDRFullFeedItems }  from 'adapters/wedata/api';

const LDR_FULL_FEED_TYPE_PRIORITIES: { [key: string]: number } = {
    'SBM': 3,
    'IND': 2,
    'INDIVIDUAL': 2,
    'SUB': 1,
    'SUBGENERAL': 1,
    'GEN': 0,
    'GENERAL': 0
};

export function updateSiteinfo(): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const [autoPagerizeItems, ldrFullFeedItems] = await Promise.all([
            getAutoPagerizeItems(),
            getLDRFullFeedItems()
        ]);

        const primaryItems = autoPagerizeItems
            .slice(0, -1)  // Remove the generic rule
            .map((item) => ({
                url: item.data.url,
                contentPath: item.data.pageElement,
                nextLinkPath: item.data.nextLink
            }));
        const secondaryItems = ldrFullFeedItems
            .sort(compareLdrFullFeedItem)
            .map((item) => ({
                url: item.data.url,
                contentPath: item.data.xpath,
                nextLinkPath: ''
            }));

        const siteinfo = {
            items: primaryItems.concat(secondaryItems),
            lastUpdatedAt: new Date().toISOString()
        };

        dispatch({
            type: 'SITEINFO_UPDATED',
            siteinfo
        });

        sendNotification({
            message: 'Siteinfo Updated',
            kind: 'positive'
        })(dispatch, getState);
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
