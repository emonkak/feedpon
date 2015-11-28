/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import update from 'react-addons-update'
import { CredentialReceived } from '../constants/eventTypes'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'

export default function connectCredentialReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<CredentialReceived>(eventEmitter, CredentialReceived)
        .select<Reducer>(({ credential }) => state => Object.assign({}, state, { credential }))
}
