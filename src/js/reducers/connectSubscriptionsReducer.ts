/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'
import { SubscriptionsReceived } from '../constants/eventTypes'

export default function connectSubscriptionsReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<SubscriptionsReceived>(eventEmitter, SubscriptionsReceived)
        .select<Reducer>(({ subscriptions }) => state => Object.assign({}, state, { subscriptions }))
}
