import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import StoreProvider from 'utils/flux/react/StoreProvider';
import createSelectors from 'messaging/createSelectors';
import packageJson from '../package.json';
import prepareStore from './prepareStore';
import routes from 'components/routes';

function main() {
    const selectors = createSelectors();
    const context = {
        environment: {
            clientId: 'feedly',
            clientSecret: '0XP4XQ07VVMDWBKUHTJM4WUQ',
            scope: 'https://cloud.feedly.com/subscriptions',
            redirectUri: 'https://www.feedly.com/feedly.html'
        },
        router: hashHistory,
        selectors
    };

    prepareStore(context)
        .then((store) => {
            store.dispatch({
                type: 'APPLICATION_INITIALIZED',
                version: packageJson.version
            });

            const element = document.getElementById('app');

            ReactDOM.render((
                <StoreProvider store={store}>
                    <Router history={hashHistory}>
                        {routes}
                    </Router>
                </StoreProvider>
            ), element);
        })
        .catch((error) => {
            console.error(error);
        });
}

if (typeof cordova === 'object') {
    document.addEventListener('deviceready', main);
} else {
    main();
}
