import Content from './Content'
import Main from './Main'
import React from 'react'
import appContextTypes from './appContextTypes'
import connectToStore from './connectToStore'
import { GetCredential, GetCategoriesCache, GetSubscriptionsCache, GetUnreadCountsCache } from '../../constants/actionTypes'
import { Router, Route } from 'react-router'
import { reducer, initialState } from '../../store'

export default class App extends React.Component {
    static contextTypes = appContextTypes

    componentDidMount() {
        this.context.dispatch({ actionType: GetCredential })
        this.context.dispatch({ actionType: GetCategoriesCache })
        this.context.dispatch({ actionType: GetSubscriptionsCache })
        this.context.dispatch({ actionType: GetUnreadCountsCache })
    }

    render() {
        return (
            <Router createElement={(Component, props) => {
                const store = this.context.createStore(reducer, initialState)
                return React.createElement(
                    connectToStore(Component, store),
                    props,
                    props.children
                )
            }}>
                <Route path="/" component={Main}>
                    <Route path="streams/:streamId" components={{ content: Content }} />
                </Route>
            </Router>
        )
    }
}
