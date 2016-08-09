import Inject from '../shared/di/annotations/Inject';
import sanitizeHtml from '../utils/sanitizeHtml';
import { IEventDispatcher, IActionHandler } from '../shared/interfaces';
import { FetchFullContent } from '../constants/actionTypes';
import { FullContentReceived } from '../constants/eventTypes';
import { IContentFinder } from '../services/contentFinder/interfaces';

@Inject
export default class FetchFullContentHandler implements IActionHandler<FetchFullContent> {
    static subscribedActionTypes = [FetchFullContent];

    constructor(private contentFinder: IContentFinder) {
    }

    async handle(action: FetchFullContent, dispatch: IEventDispatcher): Promise<void> {
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
