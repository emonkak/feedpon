/// <reference path="../DefinitelyTyped/node/node-0.11.d.ts" />
/// <reference path="./typings/rx.d.ts" />

import * as Rx from 'rx'
import connectCategoriesReducer from './reducers/connectCategoriesReducer'
import connectContentsReducer from './reducers/connectContentsReducer'
import connectCredentialReducer from './reducers/connectCredentialReducer'
import connectFullContentsReducer from './reducers/connectFullContentsReducer'
import connectSelectedStreamIdReducer from './reducers/connectSelectedStreamIdReducer'
import connectSubscriptionsReducer from './reducers/connectSubscriptionsReducer'
import connectUnreadCountsReducer from './reducers/connectUnreadCountsReducer'
import { EventEmitter } from 'events'
import { State, ObservableState } from './reducers/interfaces'

export default function appState(eventEmitter: EventEmitter): ObservableState {
    const initialState: State = {
        subscriptions: [],
        categories: [],
        unreadCounts: [],
        contents: null,
        selectedStreamId: null,
        credential: null
    }

    return Rx.Observable
        .merge([
            connectCategoriesReducer(eventEmitter),
            connectContentsReducer(eventEmitter),
            connectCredentialReducer(eventEmitter),
            connectFullContentsReducer(eventEmitter),
            connectSelectedStreamIdReducer(eventEmitter),
            connectSubscriptionsReducer(eventEmitter),
            connectUnreadCountsReducer(eventEmitter)
        ])
        .scan((state, reducer) => reducer(state), initialState)
        .startWith(initialState)
}
