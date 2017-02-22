import * as React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import AboutNavbar from 'components/AboutNavbar';
import AllEntries from 'components/AllEntries';
import CategoryEntries from 'components/CategoryEntries';
import Dashboard from 'components/Dashboard';
import DashboardNavbar from 'components/DashboardNavbar';
import FeedNavbar from 'components/FeedNavbar';
import Layout from 'components/Layout';
import PinEntries from 'components/PinEntries';
import Settings from 'components/Settings';
import SettingsNavbar from 'components/SettingsNavbar';
import SubscriptionEntries from 'components/SubscriptionEntries';

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute components={{ content: Dashboard, navbar: DashboardNavbar }} />
        <Route path="all" components={{ content: AllEntries, navbar: FeedNavbar }} />
        <Route path="pins" components={{ content: PinEntries, navbar: FeedNavbar }} />
        <Route path="subscriptions/:subscription_id" components={{ content: SubscriptionEntries, navbar: FeedNavbar }} />
        <Route path="categories/:category_id" components={{ content: CategoryEntries, navbar: FeedNavbar }} />
        <Route path="settings" components={{ content: Settings, navbar: SettingsNavbar }} />
        <Route path="about" components={{ content: About, navbar: AboutNavbar }} />
    </Route>
);

export default routes;
