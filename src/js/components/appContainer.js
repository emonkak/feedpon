import React from 'react'
import Rx from 'rx'

export default class AppContainer extends React.Component {
    static propTypes = {
        actionDispatcher: React.PropTypes.object.isRequired
    }

    static childContextTypes = {
        dispatch: React.PropTypes.func.isRequired
    }

    render() {
        return React.Children.only(this.props.children)
    }

    getChildContext() {
        const { actionDispatcher } = this.props

        return {
            dispatch(action) {
                return actionDispatcher.dispatch(action)
            }
        }
    }
}
