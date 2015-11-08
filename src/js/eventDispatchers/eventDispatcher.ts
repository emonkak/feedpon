/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />

import { Event, IEventDispatcher } from './interfaces'
import { EventEmitter } from 'events'

export default class EventDispatcher implements IEventDispatcher {
    constructor(private eventEmitter: EventEmitter) {
    }

    dispatch<T extends Event<string>>(event: T): void {
        this.eventEmitter.emit(event.eventType, event)
    }
}

