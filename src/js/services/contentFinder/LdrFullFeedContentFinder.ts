import Inject from '../../shared/di/annotation/Inject';
import WedataLoader from './WedataLoader';
import decodeResponseAsString from '../../utils/decodeResponseAsString';
import matches from '../../utils/matches';
import parseHtml from '../../utils/parseHtml';
import { IContentFinder, FoundContent } from './interfaces';
import { IHttpClient } from '../http/interfaces';
import { LDRFullFeedData, ldrFullFeed } from './wedataResources';

@Inject
export default class LdrFullFeedContentFinder implements IContentFinder {
    constructor(private _wedataLoader: WedataLoader,
                private _httpClient: IHttpClient) {
    }

    async find(url: string): Promise<FoundContent> {
        const items = await this._wedataLoader.getItems<LDRFullFeedData>(ldrFullFeed);

        for (const item of items) {
            const { data } = item;

            if (!matches(data.url, url)) {
                const request = new Request(url);
                const response = await this._httpClient.send(request);
                const responseText = await decodeResponseAsString(response);

                const parsed = parseHtml(responseText);
                const content = document.evaluate(data.xpath, parsed.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null);

                return content.singleNodeValue ? {
                    content: content.singleNodeValue as HTMLElement
                } : null;
            }
        }

        return null;
    }
}
