/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />
/// <reference path="../typings/react-addons-update.d.ts" />
/// <reference path="../typings/rx.d.ts" />

import * as Rx from 'rx'
import * as feedly from '../services/feedly/interfaces'
import update from 'react-addons-update'
import { ContentsReceived } from '../constants/eventTypes'
import { EventEmitter } from 'events'
import { Reducer, ObservableReducer } from './interfaces'

export default function connectContentsReducer(eventEmitter: EventEmitter): ObservableReducer {
    return Rx.Observable.fromEvent<ContentsReceived>(eventEmitter, ContentsReceived)
        .select(({ contents }) => contents)
        .scan((oldContents, newContents) => {
            if (oldContents && oldContents.id === newContents.id) {
                 return update(newContents, { items: { $unshift: oldContents.items } })
            } else {
                return newContents
            }
        })
        .select<Reducer>(contents => state => Object.assign({}, state, { contents }))
}

