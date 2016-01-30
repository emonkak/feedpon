/// <reference path="../DefinitelyTyped/react-router/react-router.d.ts" />

import * as eventTypes from './constants/eventTypes'
import * as feedly from './services/feedly/interfaces'
import ReducerBuilder from './shared/utils/ReducerBuilder'
import update from 'react-addons-update'
import { AnyEvent } from './shared/interfaces'

interface State {
    subscriptions: feedly.Subscription[]
    categories: feedly.Category[]
    unreadCounts: feedly.UnreadCount[]
    contents?: feedly.Contents
    credential?: feedly.Credential
    location?: HistoryModule.Location
}

export const reducer = new ReducerBuilder<State, AnyEvent>(event => event.eventType)
    .on<eventTypes.CategoriesReceived>(eventTypes.CategoriesReceived, (state, { categories }) => {
        return Object.assign({}, state, { categories })
    })
    .on<eventTypes.ContentsReceived>(eventTypes.ContentsReceived, (state, { contents }) => {
        const oldContents = state.contents
        if (oldContents && oldContents.id === contents.id) {
            contents = update(contents, { items: { $set: oldContents.items.concat(contents.items) } })
        }
        return Object.assign({}, state, { contents })
    })
    .on<eventTypes.CredentialReceived>(eventTypes.CredentialReceived, (state, { credential }) => {
        return Object.assign({}, state, { credential })
    })
    .on<eventTypes.EntryActivated>(eventTypes.EntryActivated, (state, { entry }) => {
        return Object.assign({}, state, { activeEntry: entry })
    })
    .on<eventTypes.UrlExpanded>(eventTypes.UrlExpanded, (state, { url, redirectUrl }) => {
        const { contents } = state
        if (contents == null) return state

        const items = contents.items.map(item => {
            let hasChanged = false

            const alternate = item.alternate.map(link => {
                if (link.href !== url) {
                    return link
                }
                hasChanged = true
                return { type: link.type, href: redirectUrl }
            })

            return hasChanged ? update(item, { alternate: { $set: alternate } }) : item
        })

        return update(state, { contents: { items: { $set: items } } })
    })
    .on<eventTypes.FullContentReceived>(eventTypes.FullContentReceived, (state, { fullContent }) => {
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
    .on<eventTypes.LocationUpdated>(eventTypes.LocationUpdated, (state, { location }) => {
        return Object.assign({}, state, { location })
    })
    .on<eventTypes.SubscriptionsReceived>(eventTypes.SubscriptionsReceived, (state, { subscriptions }) => {
        return Object.assign({}, state, { subscriptions })
    })
    .on<eventTypes.UnreadCountsReceived>(eventTypes.UnreadCountsReceived, (state, { unreadCounts }) => {
        return Object.assign({}, state, { unreadCounts })
    })
    .build()

export const initialState: State = {
    subscriptions: [],
    categories: [],
    unreadCounts: [],
    contents: null,
    credential: null,
    location: null
}
