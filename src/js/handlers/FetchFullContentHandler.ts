import { EventDispatcher, IActionHandler } from '../shared/interfaces';
import { FetchFullContent } from '../constants/actionTypes';
import { FullContentReceived } from '../constants/eventTypes';
import { IContentFinder } from '../services/contentFinder/interfaces';
import { IHttpClient } from '../services/http/interfaces';
import { Inject } from '../shared/di/annotations';
import sanitizeHtml from '../utils/sanitizeHtml';

@Inject
export default class FetchFullContentHandler implements IActionHandler<FetchFullContent> {
    constructor(private contentFinder: IContentFinder,
                private httpClient: IHttpClient) {
    }

    async handle(action: FetchFullContent, dispatch: EventDispatcher): Promise<void> {
        const { url, streamId } = action;
        const foundContent = await this.contentFinder.find(url);

        // TODO: When full content is not found
        if (foundContent) {
            const { content, nextLink } = foundContent;
            const sanitizedContent = sanitizeHtml(content);

            dispatch({
                eventType: FullContentReceived,
                fullContent: {
                    streamId,
                    url,
                    content: sanitizedContent,
                    nextLink: nextLink ? nextLink.getAttribute('href') : null
                }
            } as FullContentReceived);
        }
    }
}
