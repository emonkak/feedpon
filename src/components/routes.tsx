import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AboutPage from 'components/AboutPage';
import AuthenticationPage from 'components/AuthenticationPage';
import AuthenticationRequired from 'components/AuthenticationRequired';
import DashboardPage from 'components/DashboardPage';
import Layout from 'components/Layout';
import NotAuthenticated from 'components/NotAuthenticated'
import SearchPage from 'components/SearchPage';
import SettingsPage from 'components/SettingsPage';
import StreamPage from 'components/StreamPage';

const routes = (
    <Route path="/">
        <Route component={AuthenticationRequired}>
            <Route component={Layout}>
                <IndexRoute component={DashboardPage} />
                <Route path="about" component={AboutPage} />
                <Route path="search(/:query)" component={SearchPage} />
                <Route path="settings" component={SettingsPage} />
                <Route path="settings/:setting_id" component={SettingsPage} />
                <Route path="streams/:stream_id" component={StreamPage} />
            </Route>
        </Route>
        <Route component={NotAuthenticated}>
            <Route path="authentication" component={AuthenticationPage} />
        </Route>
    </Route>
);

export default routes;
