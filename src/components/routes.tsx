import * as React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import AllEntries from 'components/AllEntries';
import App from 'components/App';
import CategoryEntries from 'components/CategoryEntries';
import Dashboard from 'components/Dashboard';
import FeedNav from 'components/FeedNav';
import PinEntries from 'components/PinEntries';
import Settings from 'components/Settings';
import SubscriptionEntries from 'components/SubscriptionEntries';

const routes = (
    <Route path="/" component={App}>
        <IndexRoute components={{ main: Dashboard }} />
        <Route path="all" components={{ main: AllEntries, navbar: FeedNav }} />
        <Route path="pins" components={{ main: PinEntries, navbar: FeedNav }} />
        <Route path="subscriptions/:subscription_id" components={{ main: SubscriptionEntries, navbar: FeedNav }} />
        <Route path="categories/:category_id" components={{ main: CategoryEntries, navbar: FeedNav }} />
        <Route path="settings" components={{ main: Settings }} />
        <Route path="about" components={{ main: About }} />
    </Route>
);

export default routes;
