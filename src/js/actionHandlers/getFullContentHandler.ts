/// <reference path="../typings/whatwg-fetch.d.ts" />

import FullContentLoader from '../services/contentLoader/fullContentLoader'
import eventTypes from '../constants/eventTypes'
import { Action, IActionHandler } from '../actionDispatchers/interfaces'
import { IEventDispatcher } from '../eventDispatchers/interfaces'
import { Inject } from '../di/annotations'

interface GetFullContentAction extends Action<string> {
    url: string
}

@Inject
export default class GetFullContentHandler implements IActionHandler<GetFullContentAction, string> {
    constructor(private fullContentLoader: FullContentLoader) {
    }

    async handle(action: GetFullContentAction, eventDispatcher: IEventDispatcher): Promise<string> {
        const html = await this.fullContentLoader.load(new Request(action.url))

        if (html == null) {
            return ''
        }

        const { outerHTML } = html

        eventDispatcher.dispatch({
            eventType: eventTypes.FULL_CONTENT_RECEIVED,
            content: outerHTML
        })

        return outerHTML
    }
}
