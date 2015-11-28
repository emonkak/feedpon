/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'
import { StreamSelected } from '../constants/eventTypes'

export default function connectSelectedStreamIdReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<StreamSelected>(eventEmitter, StreamSelected)
        .select<Reducer>(({ streamId }) => state => Object.assign({}, state, { selectedStreamId: streamId }))
}
