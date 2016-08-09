import Authentication from './Authentication';
import Boot from './Boot';
import Contents from './Contents';
import Dashboard from './Dashboard';
import Layout from './Layout';
import React from 'react';
import appContextTypes from '../../shared/components/react/appContextTypes';
import connectToStore from '../../shared/components/react/connectToStore';
import { GetCredential } from '../../constants/actionTypes';
import { IndexRoute, Router, Route } from 'react-router';
import { LocationUpdated } from '../../constants/eventTypes';
import { Subscription } from 'rxjs/Subscription';
import { initialState, reducer } from '../../state';

export default class App extends React.Component {
    static contextTypes = appContextTypes;

    static propTypes = {
        history: React.PropTypes.object.isRequired
    };

    componentWillMount() {
        const { history } = this.props;

        let syncingLocation = false;
        let currentLocationKey = null;

        this._store = this.context.createStore(reducer, initialState);
        this._subscription = new Subscription();
        this._subscription.add(this._store.subscribe(({ location }) => {
            if (location && location.key !== currentLocationKey) {
                syncingLocation = true;
                history.transitionTo(location);
                syncingLocation = false;
            }
        }));
        this._subscription.add(history.listen(location => {
            currentLocationKey = location.key;

            if (!syncingLocation) {
                this.context.dispatchEvent({ eventType: LocationUpdated, location });
            }
        }));

        this.context.dispatch({ actionType: GetCredential });
    }

    componentWillUnmount() {
        this._subscription.unsubscribe();
    }

    render() {
        const { history } = this.props;
        const store = this._store;

        return (
            <Router history={history}>
                <Route path="/" component={connectToStore(Boot, store)} />
                <Route path="/authentication" component={Authentication} />
                <Route component={connectToStore(Layout, store)}>
                    <Route path="/contents/:streamId" components={connectToStore(Contents, store)} />
                    <Route path="/dashboard" component={connectToStore(Dashboard, store)} />
                </Route>
            </Router>
        );
    }
}
