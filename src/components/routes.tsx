import React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import AboutNavbar from 'components/AboutNavbar';
import Dashboard from 'components/Dashboard';
import DashboardNavbar from 'components/DashboardNavbar';
import Feed from 'components/Feed';
import FeedNavbar from 'components/FeedNavbar';
import Layout from 'components/Layout';
import Settings from 'components/Settings';
import SettingsNavbar from 'components/SettingsNavbar';

const routes = (
    <Route path="/" component={Layout}>
        <IndexRoute components={{ content: Dashboard, navbar: DashboardNavbar }} />
        <Route path="about" components={{ content: About, navbar: AboutNavbar }} />
        <Route path="feeds/:feed_id" components={{ content: Feed, navbar: FeedNavbar }} />
        <Route path="settings" components={{ content: Settings, navbar: SettingsNavbar }} />
    </Route>
);

export default routes;
