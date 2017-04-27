import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

import * as feedly from 'adapters/feedly/types';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import stripTags from 'utils/stripTags';
import { AsyncEvent, Entry, FeedOptions, FeedView, FullContent, SiteinfoItem, SyncEvent } from 'messaging/types';
import { DEFAULT_DISMISS_AFTER, sendNotification } from 'messaging/notification/actions';
import { getBookmarkCounts, getBookmarkEntry } from 'adapters/hatena/bookmarkApi';
import { getCredential } from 'messaging/credential/actions';
import { getFeed, getStreamContents } from 'adapters/feedly/api';

const URL_PATTERN = /^https?:\/\//;

export function changeFeedView(view: FeedView): SyncEvent {
    return {
        type: 'FEED_VIEW_CHANGED',
        view
    };
}

export function fetchFeed(feedId: string, options?: FeedOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FEED_FETCHING',
            feedId: feedId
        });

        const { preference } = getState();

        if (!options) {
            options = {
                numEntries: preference.defaultNumEntries,
                order: preference.defaultEntryOrder,
                onlyUnread: preference.onlyUnreadEntries,
                view: preference.defaultFeedView
            };
        }

        if (feedId.startsWith('feed/')) {
            await doFetchFeed(feedId, options)(dispatch, getState);
        } else if (feedId.startsWith('user/')) {
            await doFetchCategory(feedId, options)(dispatch, getState);
        } else if (feedId === 'all') {
            await doFetchAllCategories(options)(dispatch, getState);
        } else if (feedId === 'pins') {
            await doFetchPins(options)(dispatch, getState);
        }
    };
}

export function fetchMoreEntries(feedId: string, continuation: string, options: FeedOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'MORE_ENTRIES_FETCHING',
            feedId: feedId
        });

        const credential = await getCredential()(dispatch, getState);
        const contentsResponse = await getStreamContents(credential.token.access_token, {
            streamId: feedId,
            continuation,
            ranked: options.order,
            unreadOnly: options.onlyUnread
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

export function fetchFullContent(entryId: string, url: string): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FULL_CONTENT_FETCHING',
            entryId
        });

        const response = await fetch(url);

        if (response.ok) {
            const responseText = await decodeResponseAsText(response);

            const { siteinfo } = getState();
            const { fullContent, nextPageUrl } = extractFullContent(response.url, responseText, siteinfo.items);

            dispatch({
                type: 'FULL_CONTENT_FETCHED',
                entryId,
                fullContent,
                nextPageUrl
            });
        }
    }
}

export function markAsRead(entryIds: string[]): AsyncEvent<void> {
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
        }, 200);
    };
}

function extractFullContent(url: string, htmlString: string, siteinfoItems: SiteinfoItem[]): { fullContent: FullContent | null, nextPageUrl: string | null } {
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(htmlString, 'text/html');

    for (const item of siteinfoItems) {
        if (tryMatch(item.url, url)) {
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
                            nextPageUrl = new URL(urlString, url).toString();
                        }
                    }
                }

                return {
                    fullContent: { content, url },
                    nextPageUrl
                };
            }
        }
    }

    return { fullContent: null, nextPageUrl: null };
}

function doFetchFeed(feedId: string, options: FeedOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);
        const [contents, feed] = await Promise.all([
            getStreamContents(credential.token.access_token, {
                streamId: feedId,
                ranked: options.order,
                unreadOnly: options.onlyUnread
            }),
            getFeed(credential.token.access_token, feedId)
        ]);

        const { subscriptions } = getState();
        const subscription = new Enumerable(subscriptions.items)
            .firstOrDefault((subscription) => subscription.subscriptionId === feedId);

        const fechedFeed = {
            feedId,
            title: feed.title,
            description: feed.description || '',
            url: feed.website || '',
            subscribers: feed.subscribers,
            velocity: feed.velocity || 0,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            subscription,
            options
        };

        dispatch({
            type: 'FEED_FETCHED',
            feed: fechedFeed
        });

        doFetchBookmarkCounts(fechedFeed.entries)(dispatch, getState);
    };
}

function doFetchCategory(categoryId: string, options: FeedOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);
        const contents = await getStreamContents(credential.token.access_token, {
            streamId: categoryId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const { subscriptions } = getState();
        const category = new Enumerable(subscriptions.categories)
            .firstOrDefault((category) => category.categoryId === categoryId);

        const fechedFeed = {
            feedId: categoryId,
            title: category ? category.label : '',
            description: '',
            url: '',
            subscribers: 0,
            velocity: 0,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            subscription: null,
            options
        };

        dispatch({
            type: 'FEED_FETCHED',
            feed: fechedFeed
        });

        doFetchBookmarkCounts(fechedFeed.entries)(dispatch, getState);
    };
}

function doFetchAllCategories(options: FeedOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);

        const streamId = 'user/' + credential.token.id + '/category/global.all';
        const contents = await getStreamContents(credential.token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const fechedFeed = {
            feedId: streamId,
            title: 'All',
            description: '',
            url: '',
            subscribers: 0,
            velocity: 0,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            subscription: null,
            options
        }

        dispatch({
            type: 'FEED_FETCHED',
            feed: fechedFeed
        });

        doFetchBookmarkCounts(fechedFeed.entries)(dispatch, getState);
    };
}

function doFetchPins(options: FeedOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);

        const streamId = 'user/' + credential.token.id + '/tag/global.saved';
        const contents = await getStreamContents(credential.token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const fechedFeed = {
            feedId: streamId,
            title: 'Pins',
            description: '',
            url: '',
            subscribers: 0,
            velocity: 0,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            subscription: null,
            options
        }

        dispatch({
            type: 'FEED_FETCHED',
            feed: fechedFeed
        });

        doFetchBookmarkCounts(fechedFeed.entries)(dispatch, getState);
    };
}

function doFetchBookmarkCounts(entries: Entry[]): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const entryUrls = entries
            .filter((entry) => !!entry.url)
            .map((entry) => entry.url);

        if (entryUrls.length > 0) {
            const bookmarkCounts = await getBookmarkCounts(entryUrls);

            dispatch({
                type: 'BOOKMARK_COUNTS_FETCHED',
                bookmarkCounts
            });
        }
    };
}

function convertEntry(entry: feedly.Entry): Entry {
    const url = (entry.alternate && entry.alternate[0] && entry.alternate[0].href) || '';

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
        visual: entry.visual && URL_PATTERN.test(entry.visual.url) ? {
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
        markAsRead: !entry.unread
    };
}

function tryMatch(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str);
    } catch (error) {
        return false;
    }
}
