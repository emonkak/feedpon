import React from 'react';
import { Route, IndexRoute } from 'react-router';

import About from 'components/About';
import Authentication from 'components/Authentication';
import AuthenticationRequired from 'components/AuthenticationRequired';
import Dashboard from 'components/Dashboard';
import Feed from 'components/Feed';
import Layout from 'components/Layout';
import NotAuthenticated from 'components/NotAuthenticated'
import Settings from 'components/Settings';

const routes = (
    <Route path="/">
        <Route component={AuthenticationRequired}>
            <Route component={Layout}>
                <IndexRoute component={Dashboard} />
                <Route path="about" component={About} />
                <Route path="feeds/:feed_id" component={Feed} />
                <Route path="settings" component={Settings} />
            </Route>
        </Route>
        <Route component={NotAuthenticated}>
            <Route path="authentication" component={Authentication} />
        </Route>
    </Route>
);

export default routes;
