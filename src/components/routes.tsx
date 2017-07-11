import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AboutPage from 'components/AboutPage';
import AuthenticationPage from 'components/AuthenticationPage';
import AuthenticationRequired from 'components/AuthenticationRequired';
import CategoriesPage from 'components/CategoriesPage';
import DashboardPage from 'components/DashboardPage';
import KeyboardSettings from 'components/KeyboardSettings';
import KitchenSinkPage from 'components/KitchenSinkPage';
import NotAuthenticated from 'components/NotAuthenticated'
import RootLayout from 'components/layouts/RootLayout';
import SearchPage from 'components/SearchPage';
import SettingsPage from 'components/SettingsPage';
import SidebarLayout from 'components/layouts/SidebarLayout';
import SingleLayout from 'components/layouts/SingleLayout';
import SiteinfoSettings from 'components/SiteinfoSettings';
import StreamPage from 'components/StreamPage';
import StreamSettings from 'components/StreamSettings';
import TrackingUrlSettings from 'components/TrackingUrlSettings';
import UISettings from 'components/UISettings';

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
