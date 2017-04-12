import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/selectMany';

import {
    AsyncEvent,
    Entry,
    Feed,
    Notification,
    SyncEvent,
    ViewMode
} from './types';

import {
    allCategories,
    allSubscriptions,
    allUnreadCounts,
    authCallback,
    createAuthUrl,
    exchangeToken,
    getFeed,
    getStreamContents
} from 'supports/feedly/api';

import {
    getBookmarkCounts,
    getBookmarkEntry
} from 'supports/hatena/bookmarkApi';
getBookmarkCounts

import * as feedly from 'supports/feedly/types';

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
        const { environment } = getState();

        async function handleRedirectUrl(urlString: string): Promise<void> {
            const response = authCallback(urlString);

            if (response.error) {
                sendNotification({
                    message: 'Authentication failed: ' + response.error,
                    kind: 'negative'
                })(dispatch, getState);

                return;
            }

            const token = await exchangeToken({
                code: response.code,
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

        const url = createAuthUrl({
            client_id: environment.clientId,
            redirect_uri: environment.redirectUri,
            response_type: 'code',
            scope: environment.scope
        });

        chrome.windows.create({ url, type: 'popup' }, (window: chrome.windows.Window) => {
            observeUrlChanging(window, (url: string) => {
                if (!url.startsWith(environment.redirectUri)) {
                    return;
                }

                chrome.windows.remove(window.id);

                handleRedirectUrl(url);
            });
        });
    };
}

export function readEntry(entryIds: string[], timestamp: Date): SyncEvent {
    return {
        type: 'ENTRY_READ',
        entryIds,
        readAt: timestamp.toISOString()
    };
}

export function clearReadEntries(): SyncEvent {
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

        const { credential } = getState();

        if (credential) {
            const [categoriesResponse, subscriptionsResponse, unreadCountsResponse] = await Promise.all([
                allCategories(credential.token.access_token),
                allSubscriptions(credential.token.access_token),
                allUnreadCounts(credential.token.access_token)
            ]);

            const categories = categoriesResponse.map(category => ({
                categoryId: category.id,
                feedId: category.id,
                label: category.label
            }));

            const subscriptions = new Enumerable(subscriptionsResponse)
                .join(
                    unreadCountsResponse.unreadcounts,
                    (subscription) => subscription.id,
                    (unreadCount) => unreadCount.id,
                    (subscription, unreadCount) => ({ subscription, unreadCount })
                )
                .selectMany(({ subscription, unreadCount }) =>
                    subscription.categories.map((category) => ({
                        subscriptionId: subscription.id,
                        categoryId: category.id,
                        feedId: subscription.id,
                        title: subscription.title || '',
                        iconUrl: subscription.iconUrl || '',
                        unreadCount: unreadCount.count
                    }))
                )
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

function convertEntry(item: feedly.Entry): Entry {
    return {
        entryId: item.id,
        author: item.author || '',
        content: (item.content ? item.content.content : '') || (item.summary ? item.summary.content : ''),
        summary: (item.summary ? item.summary.content : '') || (item.content ? item.content.content : ''),
        publishedAt: new Date(item.published).toISOString(),
        title: item.title,
        url: item.alternate[0].href,
        comments: {
            isLoaded: false,
            items: []
        },
        bookmarkUrl: 'http://b.hatena.ne.jp/entry/' + item.alternate[0].href,
        bookmarkCount: 0,
        origin: {
            feedId: item.origin.streamId,
            title: item.origin.title,
            url: item.origin.htmlUrl,
        },
        markAsRead: !item.unread,
        readAt: null
    };
}

export function fetchFeed(feedId: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_FETCHING',
            feedId: feedId
        });

        const { credential } = getState();
        if (!credential) {
            sendNotification({
                message: 'Not authenticated',
                kind: 'negative'
            })(dispatch, getState);

            return;
        }

        const { subscriptions } = getState();
        const subscription = new Enumerable(subscriptions.items)
            .firstOrDefault((subscription) => subscription.subscriptionId === feedId);

        let feed: Feed | null = null;

        if (feedId.startsWith('feed/')) {
            const [contentsResponse, feedResponsse] = await Promise.all([
                getStreamContents(credential.token.access_token, {
                    streamId: feedId
                }),
                getFeed(credential.token.access_token, feedId)
            ]);

            feed = {
                feedId,
                title: feedResponsse.title,
                description: feedResponsse.description || '',
                url: feedResponsse.website || '',
                subscribers: feedResponsse.subscribers,
                velocity: feedResponsse.velocity || 0,
                entries: contentsResponse.items.map(convertEntry),
                continuation: contentsResponse.continuation || null,
                isLoading: false,
                subscription
            };
        } else if (feedId.startsWith('user/')) {
            const category = new Enumerable(subscriptions.categories)
                .firstOrDefault((category) => category.categoryId === feedId);

            const contentsResponse = await getStreamContents(credential.token.access_token, {
                streamId: feedId
            });

            feed = {
                feedId,
                title: category ? category.label : '',
                description: '',
                url: '',
                subscribers: 0,
                velocity: 0,
                entries: contentsResponse.items.map(convertEntry),
                continuation: contentsResponse.continuation || null,
                isLoading: false,
                subscription
            };
        }

        if (feed) {
            dispatch({
                type: 'FEED_FETCHED',
                feed
            });

            const entryUrls = feed.entries
                    .filter((entry) => !!entry.url)
                    .map((entry) => entry.url);

            if (entryUrls.length > 0) {
                const bookmarkCounts = await getBookmarkCounts(entryUrls);

                dispatch({
                    type: 'BOOKMARK_COUNTS_FETCHED',
                    bookmarkCounts
                });
            }
        }
    };
}

export function fetchComments(entryId: string, url: string): AsyncEvent {
    return async (dispatch) => {
        const bookmarks = await getBookmarkEntry(url);

        if (bookmarks && bookmarks.bookmarks) {
            const comments = bookmarks.bookmarks
                .filter((bookmark) => bookmark.comment !== '')
                .map((bookmark) => ({
                    user: bookmark.user,
                    comment: bookmark.comment,
                    timestamp: bookmark.timestamp
                }));

            dispatch({
                type: 'COMMENTS_FETCHED',
                entryId,
                comments
            });
        } else {
            dispatch({
                type: 'COMMENTS_FETCHED',
                entryId,
                comments: []
            });
        }
    }
}

export function sendNotification(notification: Notification): AsyncEvent {
    if (!notification.id) {
        notification.id = Date.now();
    }

    return (dispatch) => {
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

export function dismissNotification(id: any): SyncEvent {
    return {
        type: 'NOTIFICATION_DISMISSED',
        id
    };
}

export function changeViewMode(viewMode: ViewMode): SyncEvent {
    return {
        type: 'VIEW_MODE_CHANGED',
        viewMode
    };
}
