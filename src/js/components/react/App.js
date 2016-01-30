import Content from './Content'
import Dashboard from './Dashboard'
import React from 'react'
import Root from './Root'
import Sidebar from './Sidebar'
import appContextTypes from './appContextTypes'
import connectToStore from './connectToStore'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache, History } from '../../constants/actionTypes'
import { LocationUpdated } from '../../constants/eventTypes'
import { Subscription } from 'rxjs/Subscription'
import { IndexRoute, Router, Route } from 'react-router'
import { initialState, reducer } from '../../store'
import { map } from 'rxjs/operator/map'

export default class App extends React.Component {
    static contextTypes = appContextTypes

    static propTypes = {
        history: React.PropTypes.object.isRequired
    }

    componentWillMount() {
        const { history } = this.props

        let syncingLocation = false
        let currentLocationKey = null

        this._store = this.context.createStore(reducer, initialState)
        this._subscription = new Subscription()
        this._subscription.add(this.context.listen(action => {
            switch (action.actionType) {
            case History.Push:
                history.push(action.path)
                break
            case History.Replace:
                history.replace(action.path)
                break
            case History.Go:
                history.go(action.n)
                break
            case History.GoBack:
                history.goBack()
                break
            case History.GoForward:
                history.goForward()
                break
            }
        }))
        this._subscription.add(this._store.subscribe(({ location }) => {
            if (location && location.key !== currentLocationKey) {
                syncingLocation = true
                history.transitionTo(location)
                syncingLocation = false
            }
        }))
        this._subscription.add(history.listen(location => {
            currentLocationKey = location.key

            if (!syncingLocation) {
                this.context.dispatchEvent({ eventType: LocationUpdated, location })
            }
        }))
    }

    componentDidMount() {
        this.context.dispatch({ actionType: GetCredential })
        this.context.dispatch({ actionType: GetCategoriesCache })
        this.context.dispatch({ actionType: GetSubscriptionsCache })
        this.context.dispatch({ actionType: GetUnreadCountsCache })
    }

    componentWillUnmount() {
        this._subscription.unsubscribe()
    }

    render() {
        const { history } = this.props
        const store = this._store

        const ConnectedRoot = connectToStore(Root, store::map(state => ({
            credential: state.credential
        })))
        const ConnectedContent = connectToStore(Content, store::map(state => ({
            contents: state.contents,
            activeEntry: state.activeEntry
        })))
        const ConnectedDashboard = connectToStore(Dashboard, store)
        const ConnectedSidebar = connectToStore(Sidebar, store::map(state => ({
            categories: state.categories,
            credential: state.credential,
            subscriptions: state.subscriptions,
            unreadCounts: state.unreadCounts
        })))

        return (
            <Router history={history}>
                <Route path="/" component={ConnectedRoot}>
                    <Route path="streams/:streamId" components={{ content: ConnectedContent, sidebar: ConnectedSidebar }} />
                    <IndexRoute components={{ content: ConnectedDashboard, sidebar: ConnectedSidebar }} />
                </Route>
            </Router>
        )
    }
}
