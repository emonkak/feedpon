import * as browserLocalStorage from 'storages/browserLocalStorage';
import * as chromeLocalStorage from 'storages/chromeLocalStorage';
import * as indexedDBStorage from 'storages/indexedDBStorage';
import app from './app';
import { createTotalUnreadCountSelector, createVisibleSubscriptionsSelector } from 'messaging/subscriptions/selectors';

interface Storage {
    save: (state: any) => Promise<any>;
    restore: (keys: string[]) => Promise<any>;
}

function main() {
    const { save, restore } = detectStorage();
    const store = app(save, restore);

    if (typeof chrome === 'object') {
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
    }
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
