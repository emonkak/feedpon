import React from 'react'
import Rx from 'rx'

class AppContainer extends React.Component {
    static propTypes = {
        dispatcher: React.PropTypes.object.isRequired,
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
        const { dispatcher, eventEmitter } = this.props

        return {
            dispatch(action) {
                return dispatcher.dispatch(action)
            },
            getObservable(event) {
                return Rx.Observable.fromEvent(eventEmitter, event)
            }
        }
    }
}

export default AppContainer
