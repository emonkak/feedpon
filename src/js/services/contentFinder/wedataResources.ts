import { WedataResource } from './interfaces';

export interface AutoPagerizeData {
    url: string;
    nextLink: string;
    pageElement: string;
    exampleUrl?: string;
    insertBefore?: string;
}

export interface LDRFullFeedData {
    url: string;
    xpath: string;
    type: string;
    enc?: string;
    microformats?: string;
    base?: string;
}

export const autoPagerize: WedataResource<AutoPagerizeData> = {
    url: 'http://wedata.net/databases/AutoPagerize',
    transformer(items) {
        return items;
    }
};

export const ldrFullFeed: WedataResource<LDRFullFeedData> = {
    url: 'http://wedata.net/databases/LDRFullFeed',
    transformer(items) {
        const TYPE_PRIORITIES: { [key: string]: number } = {
            SBM: 0,
            IND: 1,
            INDIVIDUAL: 1,
            SUB: 2,
            SUBGENERAL: 2,
            GEN: 3,
            GENERAL: 3
        };

        return items.sort((x, y) => {
            const p1 = TYPE_PRIORITIES[x.data.type];
            const p2 = TYPE_PRIORITIES[y.data.type];
            if (p1 === p2) return 0;
            return p1 < p2 ? -1 : 1;
        });
    }
};
