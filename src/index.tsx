import FastClick from 'fastclick';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import * as browserLocalStorage from 'storages/browserLocalStorage';
import * as chromeLocalStorage from 'storages/chromeLocalStorage';
import * as indexedDBStorage from 'storages/indexedDBStorage';
import StoreProvider from 'utils/flux/react/StoreProvider';
import createSelectors from 'messaging/createSelectors';
import initializeStore from './initializeStore';
import routes from 'components/routes';

interface Storage {
    save: (state: any) => Promise<any>;
    restore: (keys: string[]) => Promise<any>;
}

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
    const { save, restore } = detectStorage();
    const store = initializeStore(context, save, restore);

    if (typeof chrome === 'object') {
        let currentTotalUnreadCount = selectors.totalUnreadCountSelector(store.getState());

        store.subscribe((state) => {
            const nextTotalUnreadCount = selectors.totalUnreadCountSelector(state);

            if (currentTotalUnreadCount !== nextTotalUnreadCount) {
                chrome.browserAction.setBadgeText({
                    text: nextTotalUnreadCount > 0 ? nextTotalUnreadCount + '' : ''
                });

                currentTotalUnreadCount = nextTotalUnreadCount;
            }
        });
    }

    FastClick.attach(document.body);

    const element = document.getElementById('app');

    ReactDOM.render((
        <StoreProvider store={store}>
            <Router history={hashHistory}>
                {routes}
            </Router>
        </StoreProvider>
    ), element);
}

function detectStorage(): Storage {
    if (typeof chrome === 'object') {
        return {
            save: chromeLocalStorage.save,
            restore: migrateFromLocalStorage(chromeLocalStorage)
        };
    }
    if (typeof indexedDB === 'object') {
        return {
            save: indexedDBStorage.save,
            restore: migrateFromLocalStorage(indexedDBStorage)
        };
    }
    return browserLocalStorage;
}

function migrateFromLocalStorage(storage: Storage): (keys: string[]) => Promise<any> {
    return async (keys) => {
        const isMigrated = !!localStorage.getItem('__isMigratedToAnotherStorage');

        if (!isMigrated) {
            const state = await browserLocalStorage.restore(keys);

            await storage.save(state);

            localStorage.setItem('__isMigratedToAnotherStorage', '' + Date.now());

            return state;
        }

        return await storage.restore(keys);
    };
}

if (typeof cordova === 'object') {
    document.addEventListener('deviceready', main);
} else {
    main();
}
