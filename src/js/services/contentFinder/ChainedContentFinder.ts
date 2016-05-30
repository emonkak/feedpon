import { IContentFinder, FoundContent } from './interfaces';
import { Inject } from '../../shared/di/annotations';

@Inject
export default class ChainedContentFinder implements IContentFinder {
    constructor(private _contentFinders: IContentFinder[]) {
    }

    async find(url: string): Promise<FoundContent> {
        for (const contentFinder of this._contentFinders) {
            const result = await contentFinder.find(url);
            if (result) {
                return result;
            }
        }
        return null;
    }
}
