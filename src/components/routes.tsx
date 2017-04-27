import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AboutPage from 'components/AboutPage';
import AuthenticationPage from 'components/AuthenticationPage';
import AuthenticationRequired from 'components/AuthenticationRequired';
import DashboardPage from 'components/DashboardPage';
import FeedPage from 'components/FeedPage';
import Layout from 'components/Layout';
import NotAuthenticated from 'components/NotAuthenticated'
import PreferencePage from 'components/PreferencePage';

const routes = (
    <Route path="/">
        <Route component={AuthenticationRequired}>
            <Route component={Layout}>
                <IndexRoute component={DashboardPage} />
                <Route path="about" component={AboutPage} />
                <Route path="feeds/:feed_id" component={FeedPage} />
                <Route path="preference" component={PreferencePage} />
            </Route>
        </Route>
        <Route component={NotAuthenticated}>
            <Route path="authentication" component={AuthenticationPage} />
        </Route>
    </Route>
);

export default routes;
