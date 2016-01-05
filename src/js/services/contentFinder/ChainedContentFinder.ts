import { IContentFinder, FoundContent } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class ChainedContentFinder implements IContentFinder {
    constructor(private contentFinders: IContentFinder[]) {
    }

    find(url: string, doc: HTMLDocument): Promise<FoundContent> {
        return this.contentFinders.reduce((promise, contentFinder) => {
            return promise.then(found => found || contentFinder.find(url, doc))
        }, Promise.resolve(null))
    }
}
