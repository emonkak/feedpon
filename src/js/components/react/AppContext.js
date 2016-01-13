import React from 'react'
import appContextTypes from './appContextTypes'
import { concat } from 'rxjs/operator/concat'
import { publishBehavior } from 'rxjs/operator/publishBehavior'
import { scan } from 'rxjs/operator/scan'
import { startWith } from 'rxjs/operator/startWith'

export default class AppContext extends React.Component {
    static propTypes = {
        actionSubject: React.PropTypes.object.isRequired,
        eventStream: React.PropTypes.object.isRequired
    }

    static childContextTypes = appContextTypes

    getChildContext() {
        const { actionSubject, eventStream } = this.props
        return {
            createStore(reducer, initialState) {
                return eventStream::scan(reducer, initialState)
                    ::startWith(initialState)
            },
            createSharedStore(reducer, initialState) {
                return eventStream::scan(reducer, initialState)
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
