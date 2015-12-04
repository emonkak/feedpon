/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'
import { UnreadCountsReceived } from '../constants/eventTypes'

export default function connectUnreadCountsReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<UnreadCountsReceived>(eventEmitter, UnreadCountsReceived)
        .select<Reducer>(({ unreadCounts }) => state => Object.assign({}, state, { unreadCounts }))
}
