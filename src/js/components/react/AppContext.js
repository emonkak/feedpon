import ConnectableStore from '../../stores/ConnectableStore'
import React from 'react'
import Store from '../../stores/Store'
import appContextTypes from './appContextTypes'

export default class AppContext extends React.Component {
    static propTypes = {
        actionDispatcher: React.PropTypes.object.isRequired,
        eventDispatcher: React.PropTypes.object.isRequired
    }

    static childContextTypes = appContextTypes

    getChildContext() {
        const { actionDispatcher, eventDispatcher } = this.props
        return {
            createStore(reducer, initialState) {
                return new ConnectableStore(new Store(reducer, initialState), eventDispatcher)
            },
            dispatch(action) {
                return actionDispatcher.dispatch(action)
            }
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}
