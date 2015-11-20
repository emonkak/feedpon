/// <reference path="../../typings/linq.d.ts" />

import * as Enumerable from 'linq'
import { WedataResource } from './interfaces'

export interface AutoPagerizeData {
    url: string
    nextLink: string
    pageElement: string
    exampleUrl?: string
    insertBefore?: string
}

export interface LDRFullFeedData {
    url: string
    xpath: string
    type: string
    enc?: string
    microformats?: string
    base?: string
}

export const autoPagerize: WedataResource<AutoPagerizeData> = {
    url: 'http://wedata.net/databases/AutoPagerize',
    transformer(items) {
        return items
    }
}

export const ldrFullFeed: WedataResource<LDRFullFeedData> = {
    url: 'http://wedata.net/databases/LDRFullFeed',
    transformer(items) {
        return Enumerable.from(items)
            .groupBy(item => {
                switch (item.data.type) {
                case 'SBM':
                    return 0;
                case 'IND':
                case 'INDIVIDUAL':
                    return 1;
                case 'SUB':
                case 'SUBGENERAL':
                    return 2;
                case 'GEN':
                case 'GENERAL':
                    return 3;
                }
            })
            .orderBy(items => items.key())
            .selectMany(items => items)
            .toArray()
    }
}
