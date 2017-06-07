import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AboutPage from 'components/AboutPage';
import AuthenticationPage from 'components/AuthenticationPage';
import AuthenticationRequired from 'components/AuthenticationRequired';
import CategoriesPage from 'components/CategoriesPage';
import DashboardPage from 'components/DashboardPage';
import NotAuthenticated from 'components/NotAuthenticated'
import SearchPage from 'components/SearchPage';
import SettingsPage from 'components/SettingsPage';
import SidebarLayout from 'components/layouts/SidebarLayout';
import SingleLayout from 'components/layouts/SingleLayout';
import StreamPage from 'components/StreamPage';

const routes = (
    <Route path="/">
        <Route component={AuthenticationRequired}>
            <Route component={SidebarLayout}>
                <IndexRoute component={DashboardPage} />
                <Route path="about" component={AboutPage} />
                <Route path="categories/(:label)" component={CategoriesPage} />
                <Route path="search/(:query)" component={SearchPage} />
                <Route path="settings/(:setting_id)" component={SettingsPage} />
                <Route path="streams/:stream_id" component={StreamPage} />
            </Route>
        </Route>
        <Route component={NotAuthenticated}>
            <Route component={SingleLayout}>
                <Route path="authentication" component={AuthenticationPage} />
            </Route>
        </Route>
    </Route>
);

export default routes;
