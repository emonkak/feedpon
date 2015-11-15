import React from 'react'
import Rx from 'rx'
import Sidebar from './sidebar'
import actionTypes from '../constants/actionTypes'
import eventTypes from '../constants/eventTypes'

class AppRoot extends React.Component {
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
            selectedStreamId: null
        }
    }

    componentDidMount() {
        const subscriptions = this.context.getObservable(eventTypes.SUBSCRIPTIONS_RECEIVED)
            .select(({ subscriptions }) => subscriptions)
        const unreadCounts = this.context.getObservable(eventTypes.UNREAD_COUNTS_RECEIVED)
            .select(({ unreadCounts }) => unreadCounts)
        const categories = this.context.getObservable(eventTypes.CATEGORIES_RECEIVED)
            .select(({ categories }) => categories)
        const selectedStreamId = this.context.getObservable(eventTypes.STREAM_SELECTED)
            .select(({ streamId }) => streamId)
            .startWith(null)

        const state = Rx.Observable.zip(
                subscriptions,
                unreadCounts,
                categories,
                (subscriptions, unreadCounts, categories) => ({ subscriptions, unreadCounts, categories })
            )
            .combineLatest(selectedStreamId, (state, selectedStreamId) => ({ ...state, selectedStreamId }))

        this.disposable = state.subscribe(newState => this.setState(newState))

        this.context.dispatch({ actionType: actionTypes.GET_SUBSCRIPTIONS_CACHE })
        this.context.dispatch({ actionType: actionTypes.GET_UNREAD_COUNTS_CACHE })
        this.context.dispatch({ actionType: actionTypes.GET_CATEGORIES_CACHE })
    }

    componentWillUnmount() {
        this.disposable.dispose()
    }

    handleAuthenticate() {
        this.context.dispatch({ actionType: actionTypes.AUTHENTICATE })
    }

    handleUpdate() {
        this.context.dispatch({ actionType: actionTypes.GET_SUBSCRIPTIONS })
        this.context.dispatch({ actionType: actionTypes.GET_UNREAD_COUNTS })
        this.context.dispatch({ actionType: actionTypes.GET_CATEGORIES })
    }

    render() {
        const { subscriptions, unreadCounts, categories, selectedStreamId } = this.state

        return (
            <div>
                <header className="l-header">
                    <div className="notification"></div>
                    <nav className="nav">
                        <ul>
                        </ul>
                    </nav>
                </header>
                <main>
                    <Sidebar subscriptions={subscriptions} unreadCounts={unreadCounts} categories={categories} selectedStreamId={selectedStreamId} />
                    <div className="l-content">
                        <button onClick={::this.handleAuthenticate}>Authenticate</button>
                        <button onClick={::this.handleUpdate}>Update</button>
                    </div>
                </main>
            </div>
        )
    }
}

export default AppRoot
