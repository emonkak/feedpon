/// <reference path="../../DefinitelyTyped/node/node-0.12.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import { CategoriesReceived } from '../constants/eventTypes'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'

export default function connectCategoriesReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<CategoriesReceived>(eventEmitter, CategoriesReceived)
        .select<Reducer>(({ categories }) => state => Object.assign({}, state, { categories }))
}
