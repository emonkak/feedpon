/// <reference path="../typings/whatwg-fetch.d.ts" />

import htmlParser from '../utils/htmlParser'
import { FullContentReceived } from '../constants/eventTypes'
import { GetFullContent } from '../constants/actionTypes'
import { IActionHandler } from './interfaces'
import { IContentFinder } from '../services/contentFinder/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IHttpClient } from '../services/http/interfaces'
import { Inject } from '../di/annotations'

@Inject
export default class GetFullContentHandler implements IActionHandler<GetFullContent, void> {
    constructor(private contentFinder: IContentFinder,
                private httpClient: IHttpClient) {
    }

    async handle(action: GetFullContent, eventDispatcher: IEventDispatcher): Promise<void> {
        const { url, streamId } = action
        const response = await this.httpClient.send(new Request(url))
        const htmlText = await response.text()

        const doc = htmlParser(htmlText)
        const foundContent = await this.contentFinder.find(url, doc)

        if (foundContent) {
            const { content, nextLink } = foundContent

            eventDispatcher.dispatch<FullContentReceived>({
                eventType: FullContentReceived,
                streamId,
                content: content.outerHTML,
                nextLink: nextLink ? nextLink.getAttribute('href') : null
            })
        }
    }
}
