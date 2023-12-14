import React from 'react';
import { History } from 'history';
import { Route, RouteComponentProps, Switch } from 'react-router';

import AboutPage from './containers/AboutPage';
import AuthenticationPage from './containers/AuthenticationPage';
import AuthenticationRequired from './helpers/AuthenticationRequired';
import CategoriesPage from './containers/CategoriesPage';
import DashboardPage from './containers/DashboardPage';
import KeyboardSettings from './containers/KeyboardSettings';
import KitchenSinkPage from './containers/KitchenSinkPage';
import NotAuthenticated from './helpers/NotAuthenticated';
import RootLayout from './layouts/RootLayout';
import SearchPage from './containers/SearchPage';
import SettingsPage from './containers/SettingsPage';
import SidebarLayout from './layouts/SidebarLayout';
import SingleLayout from './layouts/SingleLayout';
import SiteinfoSettings from './containers/SiteinfoSettings';
import StreamPage from './containers/StreamPage';
import StreamSettings from './containers/StreamSettings';
import TrackingUrlSettings from './containers/TrackingUrlSettings';
import UISettings from './containers/UISettings';
import UrlReplacementSettings from './containers/UrlReplacementSettings';

function MainWrapper(props: RouteComponentProps) {
    return (
        <SidebarLayout {...props}>
            <Switch>
                <Route exact path="/" component={DashboardPage} />
                <Route path="/about/" component={AboutPage} />
                <Route path="/categories/:label?" component={CategoriesPage} />
                <Route path="/kitchensink/" component={KitchenSinkPage} />
                <Route path="/search/:query?" component={SearchPage} />
                <Route path="/settings" component={SettingsWrapper} />
                <Route path="/streams/:stream_id" component={StreamPage} />
            </Switch>
        </SidebarLayout>
    );
}

function SettingsWrapper(props: RouteComponentProps) {
    return (
        <SettingsPage {...props}>
            <Switch>
                <Route path="/settings/keyboard" component={KeyboardSettings} />
                <Route path="/settings/siteinfo" component={SiteinfoSettings} />
                <Route path="/settings/stream" component={StreamSettings} />
                <Route path="/settings/tracking_url" component={TrackingUrlSettings} />
                <Route path="/settings/url_replacement" component={UrlReplacementSettings} />
                <Route path="/settings/ui" component={UISettings} />
            </Switch>
        </SettingsPage>
    );
}

interface RoutesProps {
    history: History;
}

export default function Routes(props: RoutesProps) {
    return (
        <RootLayout>
            <AuthenticationRequired history={props.history}>
                <Route component={MainWrapper} path="/" />
            </AuthenticationRequired>
            <NotAuthenticated history={props.history}>
                <SingleLayout>
                    <Route path="*" component={AuthenticationPage} />
                </SingleLayout>
            </NotAuthenticated>
        </RootLayout>
    );
}
