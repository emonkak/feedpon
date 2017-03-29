import React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import AboutNavbar from 'components/AboutNavbar';
import Authentication from 'components/Authentication';
import AuthenticationRequired from 'components/AuthenticationRequired';
import Dashboard from 'components/Dashboard';
import DashboardNavbar from 'components/DashboardNavbar';
import Feed from 'components/Feed';
import FeedNavbar from 'components/FeedNavbar';
import Layout from 'components/Layout';
import Settings from 'components/Settings';
import SettingsNavbar from 'components/SettingsNavbar';

const routes = (
    <Route path="/">
        <Route component={AuthenticationRequired}>
            <Route component={Layout}>
                <IndexRoute components={{ content: Dashboard, navbar: DashboardNavbar }} />
                <Route path="about" components={{ content: About, navbar: AboutNavbar }} />
                <Route path="feeds/:feed_id" components={{ content: Feed, navbar: FeedNavbar }} />
                <Route path="settings" components={{ content: Settings, navbar: SettingsNavbar }} />
            </Route>
        </Route>
        <Route path="authentication" component={Authentication} />
    </Route>
);

export default routes;
