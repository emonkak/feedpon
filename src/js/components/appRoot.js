import Content from './content'
import React from 'react'
import Rx from 'rx'
import Sidebar from './sidebar'
import actionTypes from '../constants/actionTypes'
import eventTypes from '../constants/eventTypes'

export default class AppRoot extends React.Component {
    static contextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            subscriptions: [],
            categories: [],
            unreadCounts: [],
            selectedStreamId: null,
            contents: null,
            credential: null
        }
    }

    componentDidMount() {
        const subscriptions = this.context.getObservable(eventTypes.SUBSCRIPTIONS_RECEIVED)
            .select(({ subscriptions }) => subscriptions)
        const unreadCounts = this.context.getObservable(eventTypes.UNREAD_COUNTS_RECEIVED)
            .select(({ unreadCounts }) => unreadCounts)
        const categories = this.context.getObservable(eventTypes.CATEGORIES_RECEIVED)
            .select(({ categories }) => categories)
        const contents = this.context.getObservable(eventTypes.CONTENTS_RECEIVED)
            .select(({ contents }) => contents)
            .startWith(null)
        const credential = this.context.getObservable(eventTypes.AUTHENTICATED)
            .select(({ credential }) => credential)
            .startWith(null)
        const selectedStreamId = this.context.getObservable(eventTypes.STREAM_SELECTED)
            .select(({ streamId }) => streamId)
            .startWith(null)

        const state = Rx.Observable.zip(
                subscriptions,
                unreadCounts,
                categories,
                (subscriptions, unreadCounts, categories) => ({ subscriptions, unreadCounts, categories })
            )
            .combineLatest(
                contents,
                credential,
                selectedStreamId,
                (state, contents, credential, selectedStreamId) => ({ ...state, contents, credential, selectedStreamId })
            )

        this.disposable = state.subscribe(newState => this.setState(newState))

        this.context.dispatch({ actionType: actionTypes.AUTHENTICATE })
        this.context.dispatch({ actionType: actionTypes.GET_SUBSCRIPTIONS_CACHE })
        this.context.dispatch({ actionType: actionTypes.GET_UNREAD_COUNTS_CACHE })
        this.context.dispatch({ actionType: actionTypes.GET_CATEGORIES_CACHE })
    }

    componentWillUnmount() {
        this.disposable.dispose()
    }

    render() {
        return (
            <div>
                <header className="l-header">
                    <div className="notification"></div>
                    <nav className="nav">
                        <ul>
                        </ul>
                    </nav>
                </header>
                {this.renderMain()}
            </div>
        )
    }

    renderMain() {
        const { subscriptions, unreadCounts, categories, contents, credential, selectedStreamId } = this.state

        if (credential) {
            return (
                <main>
                    <Sidebar subscriptions={subscriptions} unreadCounts={unreadCounts} categories={categories} credential={credential} selectedStreamId={selectedStreamId} />
                    <Content contents={contents} />
                </main>
            )
        } else {
            return (<main></main>)
        }
    }
}
