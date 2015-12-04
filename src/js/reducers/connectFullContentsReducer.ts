/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import * as feedly from '../services/feedly/interfaces'
import update from 'react-addons-update'
import { FullContentReceived } from '../constants/eventTypes'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'

export default function connectFullContentsReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<FullContentReceived>(eventEmitter, FullContentReceived)
        .select<Reducer>(fullContent => state => {
            const { contents } = state
            if (contents == null) return state

            const items = contents.items.map(item => {
                if (item.id === fullContent.streamId) {
                    (item as any)._fullContents = (item as any)._fullContents || []
                    return update(item, { _fullContents: { $push: [fullContent] }})
                } else {
                    return item
                }
            })

            return update(state, { contents: { items: { $set: items } } })
        })
}
