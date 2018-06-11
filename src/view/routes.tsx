import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AboutPage from 'view/containers/AboutPage';
import AuthenticationPage from 'view/containers/AuthenticationPage';
import AuthenticationRequired from 'view/helpers/AuthenticationRequired';
import CategoriesPage from 'view/containers/CategoriesPage';
import DashboardPage from 'view/containers/DashboardPage';
import KeyboardSettings from 'view/containers/KeyboardSettings';
import KitchenSinkPage from 'view/containers/KitchenSinkPage';
import NotAuthenticated from 'view/helpers/NotAuthenticated';
import RootLayout from 'view/layouts/RootLayout';
import SearchPage from 'view/containers/SearchPage';
import SettingsPage from 'view/containers/SettingsPage';
import SidebarLayout from 'view/layouts/SidebarLayout';
import SingleLayout from 'view/layouts/SingleLayout';
import SiteinfoSettings from 'view/containers/SiteinfoSettings';
import StreamPage from 'view/containers/StreamPage';
import StreamSettings from 'view/containers/StreamSettings';
import TrackingUrlSettings from 'view/containers/TrackingUrlSettings';
import UISettings from 'view/containers/UISettings';

const routes = (
    <Route component={RootLayout} path="/">
        <Route component={AuthenticationRequired}>
            <Route component={SidebarLayout}>
                <IndexRoute component={DashboardPage} />
                <Route path="about/" component={AboutPage} />
                <Route path="categories/(:label)" component={CategoriesPage} />
                <Route path="kitchensink/" component={KitchenSinkPage} />
                <Route path="search/(:query)" component={SearchPage} />
                <Route path="settings" component={SettingsPage}>
                    <Route path="keyboard" component={KeyboardSettings} />
                    <Route path="siteinfo" component={SiteinfoSettings} />
                    <Route path="stream" component={StreamSettings} />
                    <Route path="tracking_url" component={TrackingUrlSettings} />
                    <Route path="ui" component={UISettings} />
                </Route>
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
