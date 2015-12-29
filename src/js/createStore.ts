import * as eventTypes from './constants/eventTypes'
import * as feedly from './services/feedly/interfaces'
import ReducerBuilder from './stores/ReducerBuilder'
import Store from './stores/Store'
import update from 'react-addons-update'
import { IEventDispatcher } from './eventDispatchers/interfaces'

interface State {
    subscriptions: feedly.Subscription[]
    categories: feedly.Category[]
    unreadCounts: feedly.UnreadCount[]
    contents?: feedly.Contents
    selectedStreamId?: string
    credential?: feedly.Credential
}

export default function createStore() {
    const reducer = new ReducerBuilder<State>()
        .on<eventTypes.CategoriesReceived>(eventTypes.CategoriesReceived, (state, { categories }) => {
            return Object.assign({}, state, { categories })
        })
        .on<eventTypes.ContentsReceived>(eventTypes.ContentsReceived, (state, { contents }) => {
            const oldContents = state.contents
            if (oldContents && oldContents.id === contents.id) {
                contents = update(contents, { items: { $unshift: oldContents.items } })
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
        .on<eventTypes.StreamSelected>(eventTypes.StreamSelected, (state, { streamId }) => {
            return Object.assign({}, state, { selectedStreamId: streamId })
        })
        .on<eventTypes.SubscriptionsReceived>(eventTypes.SubscriptionsReceived, (state, { subscriptions }) => {
            return Object.assign({}, state, { subscriptions })
        })
        .on<eventTypes.UnreadCountsReceived>(eventTypes.UnreadCountsReceived, (state, { unreadCounts }) => {
            return Object.assign({}, state, { unreadCounts })
        })
        .build()

    const initialState: State = {
        subscriptions: [],
        categories: [],
        unreadCounts: [],
        contents: null,
        selectedStreamId: null,
        credential: null
    }

    return new Store(reducer, initialState)
}
