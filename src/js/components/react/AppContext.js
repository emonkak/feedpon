import React from 'react'
import appContextTypes from './appContextTypes'
import { concat } from 'rxjs/operator/concat'
import { publish } from 'rxjs/operator/publish'
import { publishBehavior } from 'rxjs/operator/publishBehavior'
import { scan } from 'rxjs/operator/scan'
import { startWith } from 'rxjs/operator/startWith'

export default class AppContext extends React.Component {
    static propTypes = {
        actionSubject: React.PropTypes.object.isRequired,
        eventStream: React.PropTypes.object.isRequired
    }

    static childContextTypes = appContextTypes

    componentWillMount() {
        this._eventStream = this.props.eventStream::publish()
        this._subscription = this._eventStream.connect()
    }

    componentWillUnmount() {
        this._subscription.dispose()
    }

    getChildContext() {
        const { actionSubject } = this.props
        const eventStream = this._eventStream
        return {
            createStore(reducer, initialState) {
                return eventStream
                    ::scan(reducer, initialState)
                    ::publishBehavior(initialState).refCount()
            },
            dispatch(action) {
                actionSubject.next(action)
            }
        }
    }

    render() {
        return React.Children.only(this.props.children)
    }
}
