import * as eventTypes from './constants/eventTypes'
import * as feedly from './services/feedly/interfaces'
import ReducerBuilder from './shared/stores/ReducerBuilder'
import Store from './shared/stores/Store'
import update from 'react-addons-update'
import { IEventDispatcher } from './shared/interfaces'

interface State {
    subscriptions: feedly.Subscription[]
    categories: feedly.Category[]
    unreadCounts: feedly.UnreadCount[]
    contents?: feedly.Contents
    credential?: feedly.Credential
}

export const reducer = new ReducerBuilder<State>()
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
    credential: null
}
