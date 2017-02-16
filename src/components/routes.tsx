import * as React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import AllEntries from 'components/AllEntries';
import CategoryEntries from 'components/CategoryEntries';
import Dashboard from 'components/Dashboard';
import Layout from 'components/Layout';
import PinEntries from 'components/PinEntries';
import Settings from 'components/Settings';
import SubscriptionEntries from 'components/SubscriptionEntries';

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute component={Dashboard} />
        <Route path="all" component={AllEntries} />
        <Route path="pins" component={PinEntries} />
        <Route path="subscriptions/:subscription_id" component={SubscriptionEntries} />
        <Route path="categories/:category_id" component={CategoryEntries} />
        <Route path="settings" component={Settings} />
        <Route path="about" component={About} />
    </Route>
);

export default routes;
