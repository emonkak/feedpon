/// <reference path="../../typings/linq.d.ts" />

import * as Enumerable from 'linq'
import WedataLoader from './wedataLoader'
import { IContentFinder, FoundContent , WedataItem } from './interfaces'
import { Inject } from '../../di/annotations'
import { LDRFullFeedData, ldrFullFeed } from './wedataResources'

@Inject
export default class LdrFullFeedContentFinder implements IContentFinder {
    constructor(private wedataLoader: WedataLoader) {
    }

    find(url: string, doc: HTMLDocument): Promise<FoundContent> {
        return this.wedataLoader.getItems<LDRFullFeedData>(ldrFullFeed)
            .then(items => Enumerable.from(items)
                .select(item => item.data)
                .where(entry => {
                    try {
                        return new RegExp(entry.url).test(url)
                    } catch (error) {
                        return false
                    }
                })
                .select(entry => {
                    const content = document.evaluate(entry.xpath, doc.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)

                    return {
                        content: content.singleNodeValue as HTMLElement
                    }
                })
                .firstOrDefault(({ content }) => !!content, null)
            )
    }
}
