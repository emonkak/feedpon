/// <reference path="../typings/rx.d.ts" />

import * as feedly from '../services/feedly/interfaces'

export interface State {
    subscriptions: feedly.Subscription[]
    categories: feedly.Category[]
    unreadCounts: feedly.UnreadCount[]
    contents?: feedly.Contents
    selectedStreamId?: string
    credential?: feedly.Credential
}

export interface Reducer {
    (state: State): State
}

export type ObservableReducer = Rx.Observable<Reducer>
export type ObservableState = Rx.Observable<State>
