import PureRenderMixin from 'react-addons-pure-render-mixin'
import React from 'react'
import appContextTypes from './appContextTypes'

export default function connectToStore(Component, store) {
    class StoreWrapper extends React.Component {
        componentWillMount() {
            this._subscription = store.subscribe(state => this.setState(state))
        }

        componentWillUnmount() {
            this._subscription.unsubscribe()
        }

        render() {
            return this.state ? React.createElement(Component, Object.assign({}, this.state, this.props), this.props.children) : null
        }
    }
    Object.assign(StoreWrapper.prototype, PureRenderMixin)
    return StoreWrapper
}
