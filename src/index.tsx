import app from './app';
import { createTotalUnreadCountSelector, createVisibleSubscriptionsSelector } from 'messaging/subscriptions/selectors';

function main() {
    const store = app(save, restore);

    if (typeof chrome === 'object') {
        const visibleSubscriptionsSelector = createVisibleSubscriptionsSelector();
        const totalUnreadCountSelector = createTotalUnreadCountSelector(visibleSubscriptionsSelector);

        let currentTotalUnreadCount = totalUnreadCountSelector(store.getState());

        store.subscribe((state) => {
            const nextTotalUnreadCount = totalUnreadCountSelector(state);

            if (currentTotalUnreadCount !== nextTotalUnreadCount) {
                chrome.browserAction.setBadgeText({
                    text: nextTotalUnreadCount + ''
                });

                currentTotalUnreadCount = nextTotalUnreadCount;
            }
        });
    }
}

function save(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));

    return Promise.resolve();
}

function restore(key: string): Promise<any> {
    const jsonString = localStorage.getItem(key);

    let data = null;

    if (typeof jsonString === 'string' && jsonString !== '') {
        try {
            data = JSON.parse(jsonString);
        } catch (_error) {
        }
    }

    return Promise.resolve(data);
}

if (typeof cordova === 'object') {
    document.addEventListener('deviceready', main);
} else {
    main();
}
