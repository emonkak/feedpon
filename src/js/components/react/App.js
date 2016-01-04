import Content from './Content'
import Dashboard from './Dashboard'
import React from 'react'
import Root from './Root'
import Sidebar from './Sidebar'
import appContextTypes from './appContextTypes'
import connectToStore from './connectToStore'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes'
import { Router, Route } from 'react-router'
import { browserHistory, initialState, reducer } from '../../store'

export default class App extends React.Component {
    static contextTypes = appContextTypes

    componentDidMount() {
        this.context.dispatch({ actionType: GetCredential })
        this.context.dispatch({ actionType: GetCategoriesCache })
        this.context.dispatch({ actionType: GetSubscriptionsCache })
        this.context.dispatch({ actionType: GetUnreadCountsCache })
    }

    render() {
        const store = this.context.createStore(reducer, initialState)
        const ConnectedRoot = connectToStore(Root, store)
        const ConnectedContent = connectToStore(Content, store)
        const ConnectedDashboard = connectToStore(Dashboard, store)
        const ConnectedSidebar = connectToStore(Sidebar, store)
        return (
            <Router history={browserHistory}>
                <Route path="/" component={ConnectedRoot}>
                    <Route path="streams/:streamId" components={{ content: ConnectedContent, sidebar: ConnectedSidebar }} />
                    <Route path="*" components={{ content: ConnectedDashboard, sidebar: ConnectedSidebar }} />
                </Route>
            </Router>
        )
    }
}
