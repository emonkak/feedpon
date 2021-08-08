import React from 'react';
import { History } from 'history';
import { Route, RouteComponentProps, Switch } from 'react-router';

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
import UrlReplacementSettings from 'view/containers/UrlReplacementSettings';

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
