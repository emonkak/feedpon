import querystring from 'querystring';
import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/selectMany';

import {
    AsyncEvent,
    Event,
    Notification,
    ViewMode
} from './types';

import {
    allCategories,
    allSubscriptions,
    allUnreadCounts,
    exchangeToken,
    getStreamContents
} from 'supports/feedly/api';

const DEFAULT_DISMISS_AFTER = 3000;

const DELAY = 500;

function observeUrlChanging(window: chrome.windows.Window, callback: (url: string) => void): void {
    function handleUpdateTab(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab): void {
        if (tab.windowId === window.id && tab.status === 'complete' && tab.url != null) {
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

export function authenticate(): AsyncEvent {
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

            const { environment } = getState();
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

        const { environment } = getState();

        const url = environment.endpoint + 'v3/auth/auth?' +
            querystring.stringify({
                client_id: environment.clientId,
                redirect_uri: environment.redirectUri,
                response_type: 'code',
                scope: environment.scope
            });

        chrome.windows.create({ url, type: 'popup' }, (window: chrome.windows.Window) => {
            observeUrlChanging(window, (url: string) => {
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
    return async (dispatch, getState) => {
        dispatch({
            type: 'SUBSCRIPTIONS_FETCHING'
        });

        const { environment, credential } = getState();

        if (credential) {
            const [originalCategories, originalSubscriptions, originalUnreadCounts] = await Promise.all([
                allCategories(environment.endpoint, credential.token.access_token),
                allSubscriptions(environment.endpoint, credential.token.access_token),
                allUnreadCounts(environment.endpoint, credential.token.access_token)
            ]);

            const categories = originalCategories.map(category => ({
                categoryId: category.id,
                feedId: category.id,
                title: category.label
            }));

            const subscriptions = new Enumerable(originalSubscriptions)
                .join(
                    originalUnreadCounts.unreadcounts,
                    (subscription) => subscription.id,
                    (unreadCount) => unreadCount.id,
                    (subscription, unreadCount) => ({ subscription, unreadCount })
                )
                .selectMany(({ subscription, unreadCount }) => {
                    return subscription.categories.map((category) => ({
                        subscriptionId: subscription.id,
                        categoryId: category.id,
                        feedId: subscription.id,
                        title: subscription.title || '',
                        unreadCount: unreadCount.count
                    }));
                })
                .toArray();

            dispatch({
                type: 'SUBSCRIPTIONS_FETCHED',
                categories,
                fetchedAt: new Date().toISOString(),
                subscriptions
            });
        }
    };
}

export function fetchFeed(feedId: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_FETCHING',
            feedId: feedId
        });

        const { environment, credential } = getState();

        if (!credential) {
            sendNotification({
                message: 'Not authenticated',
                kind: 'negative'
            })(dispatch, getState);

            return;
        }

        const contents = await getStreamContents(environment.endpoint, credential.token.access_token, {
            streamId: feedId
        });

        const entries = contents.items.map(item => ({
            entryId: item.id,
            author: item.author || null,
            content: (item.content ? item.content.content : null) || (item.summary ? item.summary.content : null),
            summary: (item.summary ? item.summary.content : null) || (item.content ? item.content.content : null),
            publishedAt: new Date(item.published).toISOString(),
            bookmarks: item.engagement,
            title: item.title,
            url: item.alternate[0].href,
            origin: {
                feedId: item.origin.streamId,
                title: item.origin.title,
                url: item.origin.htmlUrl,
            },
            markAsRead: !item.unread,
            readAt: null
        }));

        dispatch({
            type: 'FEED_FETCHED',
            feed: {
                feedId: contents.id,
                title: contents.title,
                description: '',
                subscribers: 0,
                entries,
                hasMoreEntries: !!contents.continuation,
                isLoading: false,
                subscription: null
            }
        });
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
