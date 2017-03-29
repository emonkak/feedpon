import querystring from 'querystring';

import rss from 'json/rss.json';
import { AsyncEvent, Category, Entry, Environment, Event, Notification, Subscription, ViewMode } from './types';
import { exchangeToken } from 'supports/feedly/api';

const SUBSCRIPTIONS: Subscription[] = [
    {
        subscriptionId: 1,
        categoryId: 1,
        feedId: '1',
        title: 'Entry',
        unreadCount: 123,
    },
    {
        subscriptionId: 2,
        categoryId: 1,
        feedId: '2',
        title: 'Really Very Long Title Entry',
        unreadCount: 0,
    },
    {
        subscriptionId: 3,
        categoryId: 1,
        feedId: '3',
        title: 'Entry',
        unreadCount: 1234,
    },
    {
        subscriptionId: 4,
        categoryId: 2,
        feedId: '4',
        title: 'Entry',
        unreadCount: 123,
    }
];

const CATEGORIES: Category[] = [
    {
        categoryId: 1,
        feedId: '101',
        title: 'Bike'
    },
    {
        categoryId: 2,
        feedId: '102',
        title: 'Programing'
    }
];

const ENTRIES: Entry[] = rss.items.map((item: any, i: number) => ({
    entryId: item.guid,
    author: item.author,
    content: item.content,
    description: item.description,
    publishedAt: item.pubDate,
    bookmarks: [0, 1, 2, 10, 11, 12, 51, 52, 53, 100, 101, 102][i % 12],
    title: item.title,
    url: item.link,
    origin: {
        feedId: rss.feed.url,
        title: rss.feed.title,
        url: rss.feed.link,
    },
    markAsRead: false
}));

const DEFAULT_DISMISS_AFTER = 3000;

const DELAY = 500;

function observeUrlChanging(window: chrome.windows.Window, callback: (url: string) => void): void {
    function handleUpdateTab(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
        if (tab.windowId === window.id && tab.status === 'complete') {
            callback(tab.url)
        }
    }

    function handleRemoveWindow(windowId: number): void {
        if (windowId === window.id) {
            unregisterListeners();
        }
    }

    function unregisterListeners(): void {
        chrome.tabs.onUpdated.removeListener(handleUpdateTab);
        chrome.windows.onRemoved.removeListener(handleRemoveWindow);
    }

    chrome.tabs.onUpdated.addListener(handleUpdateTab);
    chrome.windows.onRemoved.addListener(handleRemoveWindow);
}

export function authenticate(environment: Environment): AsyncEvent {
    return (dispatch, getState) => {
        async function handleRedirectUrl(urlString: string): Promise<void> {
            const url = new URL(urlString);
            const { searchParams } = url as any;  // XXX: Avid the type definition bug

            const error = searchParams.get('error');
            if (error) {
                sendNotification({
                    message: 'Authentication failed: ' + error,
                    kind: 'negative'
                })(dispatch, getState);

                return;
            }

            const code = searchParams.get('code');

            const token = await exchangeToken(environment.endpoint, {
                code,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                redirect_uri: environment.redirectUri,
                grant_type: 'authorization_code'
            });

            const credential = {
                authorizedAt: new Date().toISOString(),
                token
            };

            dispatch({
                type: 'AUTHENTICATED',
                credential
            });
        }

        const url = environment.endpoint + 'v3/auth/auth?' +
            querystring.stringify({
                client_id: environment.clientId,
                redirect_uri: environment.redirectUri,
                response_type: 'code',
                scope: environment.scope
            });

        chrome.windows.create({ url, type: 'popup' }, (window) => {
            observeUrlChanging(window, async (url) => {
                if (url.startsWith(environment.redirectUri)) {
                    chrome.windows.remove(window.id);

                    handleRedirectUrl(url);
                }
            });
        });
    };
}

export function readEntry(entryIds: string[], timestamp: Date): Event {
    return {
        type: 'ENTRY_READ',
        entryIds,
        readAt: timestamp.toISOString()
    };
}

export function clearReadEntries(): Event {
    return {
        type: 'READ_ENTRIES_CLEARED'
    };
}

export function saveReadEntries(entryIds: string[]): AsyncEvent {
    return (dispatch, getState) => {
        if (entryIds.length === 0) {
            return;
        }

        setTimeout(() => {
            const message = entryIds.length === 1
                ? `${entryIds.length} entry is marked as read.`
                : `${entryIds.length} entries are marked as read.`;

            dispatch({
                type: 'ENTRY_MARKED_AS_READ',
                entryIds
            });

            sendNotification({
                message,
                kind: 'positive',
                dismissAfter: DEFAULT_DISMISS_AFTER
            })(dispatch, getState);
        }, DELAY);
    };
}

export function fetchSubscriptions(): AsyncEvent {
    return dispatch => {
        dispatch({
            type: 'SUBSCRIPTIONS_FETCHING'
        });

        setTimeout(() => {
            dispatch({
                type: 'CATEGORIES_FETCHED',
                categories: CATEGORIES
            });

            dispatch({
                type: 'SUBSCRIPTIONS_FETCHED',
                subscriptions: SUBSCRIPTIONS,
                fetchedAt: new Date().toISOString()
            });
        }, DELAY);
    };
}

export function fetchFeed(feedId: string): AsyncEvent {
    return (dispatch) => {
        dispatch({
            type: 'FEED_FETCHING',
            feedId: feedId
        });

        setTimeout(() => {
            dispatch({
                type: 'FEED_FETCHED',
                feed: {
                    feedId,
                    title: 'Lorem Ipsum',
                    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
                    subscribers: 123,
                    entries: ENTRIES.map(entry => ({
                        ...entry,
                        entryId: entry.entryId + '.' + Date.now()
                    })),
                    hasMoreEntries: true,
                    isLoading: false,
                    subscription: SUBSCRIPTIONS[0]
                }
            });
        }, DELAY);
    };
}

export function unselectFeed(): Event {
    return {
        type: 'FEED_UNSELECTED'
    };
}

export function sendNotification(notification: Notification): AsyncEvent {
    if (!notification.id) {
        notification.id = Date.now();
    }

    return dispatch => {
        dispatch({
            type: 'NOTIFICATION_SENT',
            notification
        });

        if (notification.dismissAfter) {
            setTimeout(() => {
                dispatch(dismissNotification(notification.id));
            }, notification.dismissAfter);
        }
    };
}

export function dismissNotification(id: any): Event {
    return {
        type: 'NOTIFICATION_DISMISSED',
        id
    };
}

export function changeViewMode(viewMode: ViewMode): Event {
    return {
        type: 'VIEW_MODE_CHANGED',
        viewMode
    };
}
