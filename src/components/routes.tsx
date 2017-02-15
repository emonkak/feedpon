import * as React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import AllEntries from 'components/AllEntries';
import CategoryEntries from 'components/CategoryEntries';
import Dashboard from 'components/Dashboard';
import FeedNavbar from 'components/FeedNavbar';
import Layout from 'components/Layout';
import PinEntries from 'components/PinEntries';
import Settings from 'components/Settings';
import SubscriptionEntries from 'components/SubscriptionEntries';

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute components={{ main: Dashboard }} />
        <Route path="all" components={{ main: AllEntries, navbar: FeedNavbar }} />
        <Route path="pins" components={{ main: PinEntries, navbar: FeedNavbar }} />
        <Route path="subscriptions/:subscription_id" components={{ main: SubscriptionEntries, navbar: FeedNavbar }} />
        <Route path="categories/:category_id" components={{ main: CategoryEntries, navbar: FeedNavbar }} />
        <Route path="settings" components={{ main: Settings }} />
        <Route path="about" components={{ main: About }} />
    </Route>
);

export default routes;
