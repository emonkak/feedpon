import WedataLoader from './WedataLoader'
import matches from '../../utils/matches'
import { IContentFinder, FoundContent , WedataItem } from './interfaces'
import { Inject } from '../../shared/di/annotations'
import { LDRFullFeedData, ldrFullFeed } from './wedataResources'

@Inject
export default class LdrFullFeedContentFinder implements IContentFinder {
    constructor(private wedataLoader: WedataLoader) {
    }

    async find(url: string, doc: HTMLDocument): Promise<FoundContent> {
        const items = await this.wedataLoader.getItems<LDRFullFeedData>(ldrFullFeed)

        for (const item of items) {
            const entry = item.data

            if (matches(entry.url, url)) {
                const content = document.evaluate(entry.xpath, doc.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)

                if (content) {
                    return {
                        content: content.singleNodeValue as HTMLElement
                    }
                }
            }
        }
    }
}
