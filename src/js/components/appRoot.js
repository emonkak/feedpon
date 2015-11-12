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
            unreadcounts: []
        }
    }

    componentDidMount() {
        const subscriptions = this.context.getObservable(eventTypes.SUBSCRIPTIONS_RECEIVED)
            .select(({ subscriptions }) => subscriptions)
        const unreadcounts = this.context.getObservable(eventTypes.UNREAD_COUNTS_RECEIVED)
            .select(({ unreadcounts }) => unreadcounts)
        const categories = this.context.getObservable(eventTypes.CATEGORIES_RECEIVED)
            .select(({ categories }) => categories)

        const state = Rx.Observable.zip(
            subscriptions,
            unreadcounts,
            categories,
            (subscriptions, unreadcounts, categories) => ({ subscriptions, unreadcounts, categories })
        )

        this.disposable = state.subscribe(newState => this.setState(newState))
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
                    <Sidebar subscriptions={this.state.subscriptions} unreadcounts={this.state.unreadcounts} categories={this.state.categories} />
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
