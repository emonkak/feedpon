import React from 'react'
import appContextTypes from './appContextTypes'

export default class AppContext extends React.Component {
    static propTypes = {
        actionDispatcher: React.PropTypes.object.isRequired
    }

    static childContextTypes = appContextTypes

    getChildContext() {
        const { actionDispatcher } = this.props
        return {
            dispatch: (action) => actionDispatcher.dispatch(action)
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}
