import Content from './Content'
import Dashboard from './Dashboard'
import React from 'react'
import Root from './Root'
import Sidebar from './Sidebar'
import appContextTypes from './appContextTypes'
import connectToStore from './connectToStore'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes'
import { browserHistory, IndexRoute, Router, Route } from 'react-router'
import { initialState, reducer } from '../../store'
import { map } from 'rxjs/operator/map'
import { share } from 'rxjs/operator/share'

export default class App extends React.Component {
    static contextTypes = appContextTypes

    componentDidMount() {
        this.context.dispatch({ actionType: GetCredential })
        this.context.dispatch({ actionType: GetCategoriesCache })
        this.context.dispatch({ actionType: GetSubscriptionsCache })
        this.context.dispatch({ actionType: GetUnreadCountsCache })
    }

    render() {
        const store = this.context.createStore(reducer, initialState)::share()
        const ConnectedRoot = connectToStore(Root, store::map(state => ({
            credential: state.credential
        })))
        const ConnectedContent = connectToStore(Content, store::map(state => ({
            contents: state.contents
        })))
        const ConnectedDashboard = connectToStore(Dashboard, store)
        const ConnectedSidebar = connectToStore(Sidebar, store::map(state => ({
            categories: state.categories,
            credential: state.credential,
            subscriptions: state.subscriptions,
            unreadCounts: state.unreadCounts
        })))
        return (
            <Router history={browserHistory}>
                <Route path="/" component={ConnectedRoot}>
                    <Route path="streams/:streamId" components={{ content: ConnectedContent, sidebar: ConnectedSidebar }} />
                    <IndexRoute components={{ content: ConnectedDashboard, sidebar: ConnectedSidebar }} />
                </Route>
            </Router>
        )
    }
}
