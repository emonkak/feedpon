import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/join';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/selectMany';

import {
    AsyncEvent,
    Credential,
    Entry,
    Feed,
    FeedSpecification,
    FeedView,
    FullContent,
    Notification,
    Siteinfo,
    SyncEvent
} from './types';

import {
    allCategories,
    allSubscriptions,
    allUnreadCounts,
    authCallback,
    createAuthUrl,
    exchangeToken,
    getFeed,
    getStreamContents,
    refreshToken
} from 'adapters/feedly/api';

import * as feedly from 'adapters/feedly/types';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import stripTags from 'utils/stripTags';
import { LDRFullFeedData, WedataItem }  from 'adapters/wedata/types';
import { getAutoPagerizeItems, getLDRFullFeedItems }  from 'adapters/wedata/api';
import { getBookmarkCounts, getBookmarkEntry } from 'adapters/hatena/bookmarkApi';

const DEFAULT_DISMISS_AFTER = 3000;

const DELAY = 500;

export function authenticate(): AsyncEvent<void> {
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

export function saveReadEntries(entryIds: string[]): AsyncEvent<void> {
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

export function fetchSubscriptions(): AsyncEvent<void> {
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

function getCredential(): AsyncEvent<Promise<Credential>> {
    return async (dispatch, getState) => {
        let { credential } = getState();

        if (!credential) {
            throw new Error('Not authenticated');
        }

        const now = new Date();
        const expiredAt = new Date(credential.authorizedAt).getTime() + (credential.token.expires_in * 1000);
        const isExpired = expiredAt < now.getTime() + 1000 * 60;

        if (isExpired) {
            const { environment } = getState();
            const token = await refreshToken({
                refresh_token: credential.token.refresh_token,
                client_id: environment.clientId,
                client_secret: environment.clientSecret,
                grant_type: 'refresh_token'
            });

            credential = {
                authorizedAt: now.toISOString(),
                token: {
                    ...credential.token,
                    ...token
                }
            }

            dispatch({
                type: 'AUTHENTICATED',
                credential
            });
        }

        return credential;
    };
}

const URL_PATTEN = /^https?:\/\//;

function convertEntry(entry: feedly.Entry): Entry {
    const url = URL_PATTEN.test(entry.originId)
        ? entry.originId
        : (entry.alternate && entry.alternate[0] && entry.alternate[0].href) || '';

    return {
        entryId: entry.id,
        author: entry.author || '',
        summary: stripTags((entry.summary ? entry.summary.content : '') || (entry.content ? entry.content.content : '')),
        content: (entry.content ? entry.content.content : '') || (entry.summary ? entry.summary.content : ''),
        fullContents: {
            isLoaded: false,
            isLoading: false,
            items: [],
            nextPageUrl: ''
        },
        publishedAt: new Date(entry.published).toISOString(),
        title: entry.title,
        url,
        visual: entry.visual && URL_PATTEN.test(entry.visual.url) ? {
            url: entry.visual.url,
            width: entry.visual.width,
            height: entry.visual.height
        } : null,
        comments: {
            isLoaded: false,
            items: []
        },
        bookmarkUrl: 'http://b.hatena.ne.jp/entry/' + url,
        bookmarkCount: 0,
        origin: entry.origin ? {
            feedId: entry.origin.streamId,
            title: entry.origin.title,
            url: entry.origin.htmlUrl,
        } : null,
        markAsRead: !entry.unread,
        readAt: null
    };
}

export function fetchFeed(feedId: string, specification?: FeedSpecification): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_FETCHING',
            feedId: feedId
        });

        const { preference, subscriptions } = getState();

        if (!specification) {
            specification = {
                numEntries: preference.defaultNumEntries,
                order: preference.defaultEntryOrder,
                onlyUnread: preference.onlyUnreadEntries
            };
        }

        const credential = await getCredential()(dispatch, getState);
        const subscription = new Enumerable(subscriptions.items)
            .firstOrDefault((subscription) => subscription.subscriptionId === feedId);

        let feed: Feed | null = null;

        if (feedId.startsWith('feed/')) {
            const [contentsResponse, feedResponse] = await Promise.all([
                getStreamContents(credential.token.access_token, {
                    streamId: feedId,
                    ranked: specification.order,
                    unreadOnly: specification.onlyUnread
                }),
                getFeed(credential.token.access_token, feedId)
            ]);

            feed = {
                feedId,
                title: feedResponse.title,
                description: feedResponse.description || '',
                url: feedResponse.website || '',
                subscribers: feedResponse.subscribers,
                velocity: feedResponse.velocity || 0,
                entries: contentsResponse.items.map(convertEntry),
                continuation: contentsResponse.continuation || null,
                isLoading: false,
                isLoaded: true,
                subscription,
                specification,
                view: preference.defaultFeedView
            };
        } else if (feedId.startsWith('user/')) {
            const category = new Enumerable(subscriptions.categories)
                .firstOrDefault((category) => category.categoryId === feedId);

            const contentsResponse = await getStreamContents(credential.token.access_token, {
                streamId: feedId,
                ranked: specification.order,
                unreadOnly: specification.onlyUnread
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
                isLoaded: true,
                subscription,
                specification,
                view: preference.defaultFeedView
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

export function fetchMoreEntries(feedId: string, continuation: string, specification: FeedSpecification): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'MORE_ENTRIES_FETCHING',
            feedId: feedId
        });

        const credential = await getCredential()(dispatch, getState);
        const contentsResponse = await getStreamContents(credential.token.access_token, {
            streamId: feedId,
            continuation,
            ranked: specification.order,
            unreadOnly: specification.onlyUnread
        });

        dispatch({
            type: 'MORE_ENTRIES_FETCHED',
            feedId,
            entries: contentsResponse.items.map(convertEntry),
            continuation: contentsResponse.continuation || null
        });
    };
}

export function fetchComments(entryId: string, url: string): AsyncEvent<void> {
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

async function extractFullContent(url: string, siteinfo: Siteinfo): Promise<{ fullContent: FullContent | null, nextPageUrl: string | null }> {
    const response = await fetch(url);

    if (response.ok) {
        const responseText = await decodeResponseAsText(response);

        const parser = new DOMParser();
        const parsedDocument = parser.parseFromString(responseText, 'text/html');

        for (const item of siteinfo.items) {
            if (matches(item.url, response.url)) {
                let content = '';
                let nextPageUrl: string | null = null;

                const contentResult = document.evaluate(
                    item.contentPath,
                    parsedDocument.body,
                    null,
                    XPathResult.ORDERED_NODE_ITERATOR_TYPE,
                    null
                );

                for (
                    let node = contentResult.iterateNext();
                    node;
                    node = contentResult.iterateNext()
                ) {
                    if (node instanceof Element) {
                        content += node.outerHTML;
                    }
                }

                if (content) {
                    if (item.nextLinkPath) {
                        const nextLinkResult = document.evaluate(
                            item.nextLinkPath,
                            parsedDocument.body,
                            null,
                            XPathResult.FIRST_ORDERED_NODE_TYPE,
                            null
                        );

                        const node = nextLinkResult.singleNodeValue;

                        if (node && node instanceof HTMLElement) {
                            const urlString = node.getAttribute('href');

                            if (urlString) {
                                nextPageUrl = new URL(urlString, response.url).toString();
                            }
                        }
                    }

                    return {
                        fullContent: { content, url: response.url },
                        nextPageUrl
                    };
                }
            }
        }
    }

    return { fullContent: null, nextPageUrl: null };
}

export function fetchFullContent(entryId: string, url: string): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FULL_CONTENT_FETCHING',
            entryId
        });

        const { siteinfo } = getState();
        const { fullContent, nextPageUrl } = await extractFullContent(url, siteinfo);

        dispatch({
            type: 'FULL_CONTENT_FETCHED',
            entryId,
            fullContent,
            nextPageUrl
        });
    }
}

function matches(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str);
    } catch (error) {
        return false;
    }
}

export function sendNotification(notification: Notification): AsyncEvent<void> {
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

export function changeFeedView(view: FeedView): SyncEvent {
    return {
        type: 'FEED_VIEW_CHANGED',
        view
    };
}

const LDR_FULL_FEED_TYPE_PRIORITIES: { [key: string]: number } = {
    'SBM': 3,
    'IND': 2,
    'INDIVIDUAL': 2,
    'SUB': 1,
    'SUBGENERAL': 1,
    'GEN': 0,
    'GENERAL': 0
};

function compareLdrFullFeedItem(x: WedataItem<LDRFullFeedData>, y: WedataItem<LDRFullFeedData>): number {
    const p1 = LDR_FULL_FEED_TYPE_PRIORITIES[x.data.type];
    const p2 = LDR_FULL_FEED_TYPE_PRIORITIES[y.data.type];
    if (p1 === p2) {
        return 0;
    }
    return p1 < p2 ? 1 : -1;
}

export function updateSiteinfo(): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const [autoPagerizeItems, ldrFullFeedItems] = await Promise.all([
            getAutoPagerizeItems(),
            getLDRFullFeedItems()
        ]);

        const primaryItems = autoPagerizeItems
            .slice(0, -1)  // Remove the generic rule
            .map((item) => ({
                url: item.data.url,
                contentPath: item.data.pageElement,
                nextLinkPath: item.data.nextLink
            }));
        const secondaryItems = ldrFullFeedItems
            .sort(compareLdrFullFeedItem)
            .map((item) => ({
                url: item.data.url,
                contentPath: item.data.xpath,
                nextLinkPath: ''
            }));

        const siteinfo = {
            items: primaryItems.concat(secondaryItems),
            lastUpdatedAt: new Date().toISOString()
        };

        dispatch({
            type: 'SITEINFO_UPDATED',
            siteinfo
        });

        sendNotification({
            message: 'Siteinfo Updated',
            kind: 'positive'
        })(dispatch, getState);
    };
}
