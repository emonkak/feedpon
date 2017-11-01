import app from './app';
import { createTotalUnreadCountSelector, createVisibleSubscriptionsSelector } from 'messaging/subscriptions/selectors';

function main() {
    if (typeof chrome === 'object') {
        const store = app(chromeStorageSave, chromeStorageRestore);
        const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector();
        const totalUnreadCountSelector = createTotalUnreadCountSelector(visibleSubscriptionsSelector);

        let currentTotalUnreadCount = totalUnreadCountSelector(store.getState());

        store.subscribe((state) => {
            const nextTotalUnreadCount = totalUnreadCountSelector(state);

            if (currentTotalUnreadCount !== nextTotalUnreadCount) {
                chrome.browserAction.setBadgeText({
                    text: nextTotalUnreadCount > 0 ? nextTotalUnreadCount + '' : ''
                });

                currentTotalUnreadCount = nextTotalUnreadCount;
            }
        });
    } else {
        app(localStorageSave, localStorageRestore);
    }
}

function localStorageSave(state: any): Promise<void> {
    for (const key in state) {
        localStorage.setItem(key, JSON.stringify(state[key]));
    }

    return Promise.resolve();
}

function localStorageRestore(keys: string[]): Promise<any> {
    let state: { [key: string]: any } = {};

    for (const key of keys) {
        const jsonString = localStorage.getItem(key);

        if (typeof jsonString === 'string' && jsonString !== '') {
            try {
                state[key] = JSON.parse(jsonString);
            } catch (_error) {
            }
        }
    }

    return Promise.resolve(state);
}

function chromeStorageSave(state: any): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set(state, resolve);
    });
}

function chromeStorageRestore(keys: string[]): Promise<any> {
    const isMigrated = !!localStorage.getItem('__isMigratedToChromeStorage');
    if (!isMigrated) {
        const state = localStorageRestore(keys);

        return chromeStorageSave(state).then(() => {
            localStorage.setItem('__isMigratedToChromeStorage', '' + Date.now());
            return state;
        });
    }

    return new Promise((resolve) => {
        chrome.storage.local.get(keys, resolve);
    });
}

if (typeof cordova === 'object') {
    document.addEventListener('deviceready', main);
} else {
    main();
}
