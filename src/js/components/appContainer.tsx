/// <reference path="../../DefinitelyTyped/node/node-0.11.d.ts" />
/// <reference path="../../DefinitelyTyped/react/react.d.ts" />

import * as React from 'react'
import { EventEmitter } from 'events'
import { IActionDispatcher } from '../actions/interfaces'

interface Props {
    dispatcher: IActionDispatcher<any>
    eventEmitter: EventEmitter,
    children: React.ReactNode
}
interface State {}

export default class AppContainer extends React.Component<Props, State> {
    static propTypes: React.ValidationMap<any> = {
        dispatcher: React.PropTypes.object.isRequired,
        eventEmitter: React.PropTypes.object.isRequired
    }

    static childContextTypes: React.ValidationMap<any> = {
        dispatcher: React.PropTypes.object.isRequired,
        eventEmitter: React.PropTypes.object.isRequired
    }

    render() {
        return (<div>{this.props.children}</div>)
    }

    getChildContext() {
        return {
            dispatcher: this.props.dispatcher,
            eventEmitter: this.props.eventEmitter
        }
    }
}
