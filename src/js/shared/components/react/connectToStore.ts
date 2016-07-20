import * as PureRenderMixin from 'react-addons-pure-render-mixin';
import * as React from 'react';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

export default function connectToStore<TState>(Component: React.ComponentClass<any>, store: Observable<TState>): React.ComponentClass<any> {
    class StoreWrapper extends React.Component<any, TState> {
        private _subscription: Subscription;

        componentWillMount() {
            this._subscription = store.subscribe(state => this.setState(state));
        }

        componentWillUnmount() {
            this._subscription.unsubscribe();
        }

        render() {
            return this.state ? React.createElement(Component, Object.assign({}, this.state, this.props), this.props.children) : null;
        }
    }
    Object.assign(StoreWrapper.prototype, PureRenderMixin);
    return StoreWrapper;
}
