/// <reference path="../typings/whatwg-fetch.d.ts" />

import eventTypes from '../constants/eventTypes'
import htmlParser from '../utils/htmlParser'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IContentFinder } from '../services/contentFinder/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { IHttpClient } from '../services/http/interfaces'
import { Inject } from '../di/annotations'

interface GetFullContentAction extends Action<string> {
    url: string
}

interface GetFullContentResult {
    content: string
    nextLink?: string
}

@Inject
export default class GetFullContentHandler implements IActionHandler<GetFullContentAction, GetFullContentResult> {
    constructor(private contentFinder: IContentFinder,
                private httpClient: IHttpClient) {
    }

    async handle(action: GetFullContentAction, eventDispatcher: IEventDispatcher): Promise<GetFullContentResult> {
        const response = await this.httpClient.send(new Request(action.url))
        const htmlText = await response.text()

        const doc = htmlParser(htmlText)
        const foundContent = await this.contentFinder.find(action.url, doc)
        if (foundContent == null) return Promise.resolve(null)

        const { content, nextLink } = foundContent

        return {
            content: content.outerHTML,
            nextLink: nextLink ? nextLink.getAttribute('href') : null
        }
    }
}
