import * as eventTypes from './constants/eventTypes'
import * as feedly from './services/feedly/interfaces'
import Store from './store'
import update from 'react-addons-update'

interface AppState {
    subscriptions: feedly.Subscription[]
    categories: feedly.Category[]
    unreadCounts: feedly.UnreadCount[]
    contents?: feedly.Contents
    selectedStreamId?: string
    credential?: feedly.Credential
}

const initialState: AppState = {
    subscriptions: [],
    categories: [],
    unreadCounts: [],
    contents: null,
    selectedStreamId: null,
    credential: null
}

export default function storeProvider() {
    return new Store(initialState)
        .case<eventTypes.CategoriesReceived>(eventTypes.CategoriesReceived, (state, { categories }) => {
            return Object.assign({}, state, { categories })
        })
        .case<eventTypes.ContentsReceived>(eventTypes.ContentsReceived, (state, { contents }) => {
            const oldContents = state.contents
            if (oldContents && oldContents.id === contents.id) {
                contents = update(contents, { items: { $unshift: oldContents.items } })
            }
            return Object.assign({}, state, { contents })
        })
        .case<eventTypes.CredentialReceived>(eventTypes.CredentialReceived, (state, { credential }) => {
            return Object.assign({}, state, { credential })
        })
        .case<eventTypes.FullContentReceived>(eventTypes.FullContentReceived, (state, { fullContent }) => {
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
        .case<eventTypes.StreamSelected>(eventTypes.StreamSelected, (state, { streamId }) => {
            return Object.assign({}, state, { selectedStreamId: streamId })
        })
        .case<eventTypes.SubscriptionsReceived>(eventTypes.SubscriptionsReceived, (state, { subscriptions }) => {
            return Object.assign({}, state, { subscriptions })
        })
        .case<eventTypes.UnreadCountsReceived>(eventTypes.UnreadCountsReceived, (state, { unreadCounts }) => {
            return Object.assign({}, state, { unreadCounts })
        })
}
