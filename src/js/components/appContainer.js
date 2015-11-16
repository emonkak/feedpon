import React from 'react'
import Rx from 'rx'

export default class AppContainer extends React.Component {
    static propTypes = {
        actionDispatcher: React.PropTypes.object.isRequired,
        eventEmitter: React.PropTypes.object.isRequired
    }

    static childContextTypes = {
        dispatch: React.PropTypes.func.isRequired,
        getObservable: React.PropTypes.func.isRequired
    }

    render() {
        return (<div>{this.props.children}</div>)
    }

    getChildContext() {
        const { actionDispatcher, eventEmitter } = this.props

        return {
            dispatch(action) {
                return actionDispatcher.dispatch(action)
            },
            getObservable(event) {
                return Rx.Observable.fromEvent(eventEmitter, event)
            }
        }
    }
}
