import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';

import Bootstrap from 'view/Bootstrap';
import prepareSelectors from 'messaging/prepareSelectors';
import prepareStore from './prepareStore';

function main() {
    const hashHistory = createHashHistory();

    const selectors = prepareSelectors();
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
    const preparingStore = prepareStore(context);

    const element = document.getElementById('app');

    return ReactDOM.render(
        <Bootstrap preparingStore={preparingStore} history={hashHistory} />,
        element
    );
}

if (typeof cordova === 'object') {
    document.addEventListener('deviceready', main);
} else {
    main();
}
