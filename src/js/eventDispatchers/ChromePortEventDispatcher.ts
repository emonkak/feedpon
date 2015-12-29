/// <reference path="../typings/chrome.d.ts" />

import { Event, IEventDispatcher, Subscriber, Subscription } from './interfaces'

export default class ChromePortEventDispatcher implements IEventDispatcher {
    constructor(private port: chrome.runtime.Port) {
    }

    dispatch<T extends Event<string>>(event: T): void {
        this.port.postMessage(event)
    }
}
