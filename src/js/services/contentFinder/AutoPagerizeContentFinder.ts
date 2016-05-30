import WedataLoader from './WedataLoader';
import decodeResponseAsString from '../../utils/decodeResponseAsString';
import matches from '../../utils/matches';
import parseHtml from '../../utils/parseHtml';
import { AutoPagerizeData, autoPagerize } from './wedataResources';
import { IContentFinder, FoundContent , WedataItem } from './interfaces';
import { IHttpClient } from '../http/interfaces';
import { Inject } from '../../shared/di/annotations';

@Inject
export default class AutoPagerizeContentFinder implements IContentFinder {
    constructor(private _wedataLoader: WedataLoader,
                private _httpClient: IHttpClient) {
    }

    async find(url: string): Promise<FoundContent> {
        const items = await this._wedataLoader.getItems<AutoPagerizeData>(autoPagerize);

        for (const item of items) {
            const { data } = item;

            if (matches(data.url, url)) {
                const request = new Request(url);
                const response = await this._httpClient.send(request);
                const responseText = await decodeResponseAsString(response);

                const parsed = parseHtml(responseText);
                const content = document.evaluate(data.pageElement, parsed.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null);
                const nextLink = document.evaluate(data.nextLink, parsed.body, null, XPathResult.ANY_UNORDERED_NODE_TYPE, null);

                return content.singleNodeValue ? {
                    content: content.singleNodeValue as HTMLElement,
                    nextLink: nextLink.singleNodeValue as HTMLElement
                } : null;
            }
        }
    }
}
