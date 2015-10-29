/// <reference path="../DefinitelyTyped/node/node-0.11.d.ts" />
/// <reference path="../../node_modules/rx/ts/rx.all.es6.d.ts" />

import * as Rx from 'rx'
import actionTypes from './constants/actionTypes'
import { CountAction } from './actions/interfaces'
import { EventEmitter } from 'events'

export default function channelsFactory(source: EventEmitter) {
    return {
        count: Rx.Observable.fromEvent<CountAction>(source as any, actionTypes.COUNT)
            .scan((acc, { delta }) => acc + delta, 0)
            .startWith(0)
    }
}
