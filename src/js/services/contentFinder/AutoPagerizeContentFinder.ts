import WedataLoader from './WedataLoader'
import matches from '../../utils/matches'
import { AutoPagerizeData, autoPagerize } from './wedataResources'
import { IContentFinder, FoundContent , WedataItem } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class AutoPagerizeContentFinder implements IContentFinder {
    constructor(private wedataLoader: WedataLoader) {
    }

    async find(url: string, doc: HTMLDocument): Promise<FoundContent> {
        const items = await this.wedataLoader.getItems<AutoPagerizeData>(autoPagerize)

        for (const item of items) {
            const entry = item.data

            if (matches(entry.url, url)) {
                const content = document.evaluate(entry.pageElement, doc.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)
                const nextLink = document.evaluate(entry.nextLink, doc.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null)

                if (content.singleNodeValue) {
                    return {
                        content: content.singleNodeValue as HTMLElement,
                        nextLink: nextLink.singleNodeValue as HTMLElement
                    }
                }
            }
        }
    }
}
