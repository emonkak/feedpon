import UrlExpander from '../services/urlExpander/UrlExpander'
import { EventDispatcher, IActionHandler } from '../shared/interfaces'
import { ExpandUrl } from '../constants/actionTypes'
import { Inject } from '../shared/di/annotations'
import { UrlExpanded } from '../constants/eventTypes'

@Inject
export default class ExpandUrlHandler implements IActionHandler<ExpandUrl> {
    constructor(private _urlExpander: UrlExpander) {
    }

    async handle(action: ExpandUrl, dispatch: EventDispatcher): Promise<void> {
        const { url } = action
        const redirection = await this._urlExpander.expand(url)

        if (redirection.url !== redirection.redirectUrl) {
            dispatch({
                eventType: UrlExpanded,
                url,
                redirectUrl: redirection.redirectUrl
            } as UrlExpanded)
        }
    }
}
