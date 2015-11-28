/// <reference path="../../typings/linq.d.ts" />

import Enumerable from 'linq'
import WedataLoader from './wedataLoader'
import { AutoPagerizeData, autoPagerize } from './wedataResources'
import { IContentFinder, FoundContent , WedataItem } from './interfaces'
import { Inject } from '../../di/annotations'

@Inject
export default class AutoPagerizeContentFinder implements IContentFinder {
    constructor(private wedataLoader: WedataLoader) {
    }

    find(url: string, doc: HTMLDocument): Promise<FoundContent> {
        return this.wedataLoader.getItems<AutoPagerizeData>(autoPagerize)
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
                    const content = document.evaluate(entry.pageElement, doc.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)
                    const nextLink = document.evaluate(entry.nextLink, doc.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)

                    return {
                        content: content.singleNodeValue as HTMLElement,
                        nextLink: nextLink.singleNodeValue as HTMLElement,
                    }
                })
                .firstOrDefault(({ content }) => !!content, null)
            )
    }
}
