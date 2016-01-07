import React from 'react'
import appContextTypes from './appContextTypes'

export default function connectToStore(Component, store) {
    class StoreWrapper extends React.Component {
        componentDidMount() {
            this._subscription = store.subscribe(state => this.setState(state))
        }

        componentWillUnmount() {
            this._subscription.unsubscribe()
        }

        render() {
            return this.state ? React.createElement(Component, Object.assign({}, this.state, this.props), this.props.children) : null
        }
    }
    return StoreWrapper
}
