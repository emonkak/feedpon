import * as React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from 'components/App';
import About from 'components/About';
import AllFeeds from 'components/AllFeeds';
import PinFeeds from 'components/PinFeeds';
import CategoryFeeds from 'components/CategoryFeeds';
import SubscriptionFeeds from 'components/SubscriptionFeeds';
import Settings from 'components/Settings';
import Dashboard from 'components/Dashboard';

const routes = (
    <Route path="/" component={App}>
        <IndexRoute component={Dashboard} />
        <Route path="all" component={AllFeeds} />    
        <Route path="pins" component={PinFeeds} />    
        <Route path="subscriptions/:subscription_id" component={SubscriptionFeeds} />
        <Route path="categories/:category_id" component={CategoryFeeds} />
        <Route path="settings" component={Settings} />
        <Route path="about" component={About} />
    </Route>
);

export default routes;
