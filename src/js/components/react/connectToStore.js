import React from 'react'
import appContextTypes from './appContextTypes'

export default function connectToStore(Component, store) {
    class StoreWrapper extends React.Component {
        constructor(props) {
            super(props)
            this.state = store.getState()
            this._subscription = null
        }

        componentDidMount() {
            this._subscription = store.subscribe(state => this.setState(state))
        }

        componentWillUnmount() {
            this._subscription.dispose()
        }

        render() {
            const props = Object.assign({}, this.state, this.props)
            return React.createElement(Component, props, props.children)
        }
    }
    return StoreWrapper
}
