import * as bookmarkApi from 'adapters/hatena/bookmarkApi';
import * as feedly from 'adapters/feedly/types';
import * as feedlyApi from 'adapters/feedly/api';
import PromiseQueue from 'utils/PromiseQueue';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import fetch from 'adapters/http/fetch';
import stripTags from 'utils/stripTags';
import tryMatch from 'utils/tryMatch';
import { ALL_STREAM_ID, PINS_STREAM_ID } from 'messaging/streams/constants';
import { AsyncThunk, Category, Entry, Event, Stream, StreamFetchOptions, StreamViewKind, Subscription, Thunk } from 'messaging/types';
import { expandUrl } from 'messaging/trackingUrls/actions';
import { getFeedlyToken } from 'messaging/backend/actions';
import { getSiteinfoItems } from 'messaging/sharedSiteinfo/actions';
import { sendNotification } from 'messaging/notifications/actions';

export function fetchStream(streamId: string, streamView?: StreamViewKind, fetchOptions?: StreamFetchOptions): AsyncThunk {
    return async ({ dispatch, getState }) => {
        const { streams } = getState();
        const fetchedAt = Date.now();

        if (!streamView) {
            streamView = streams.defaultStreamView;
        }

        if (!fetchOptions) {
            fetchOptions = streams.defaultFetchOptions;

            if (streamId === PINS_STREAM_ID) {
                fetchOptions = {
                    ...fetchOptions,
                    onlyUnread: false
                };
            }
        }

        dispatch({
            type: 'STREAM_FETCHING',
            streamId,
            streamView,
            fetchOptions,
            fetchedAt
        });

        let stream = null;

        try {
            if (streamId.startsWith('feed/')) {
                stream = await dispatch(fetchFeedStream(streamId, streamView, fetchOptions, fetchedAt));
            } else if (streamId.startsWith('user/')) {
                stream = await dispatch(fetchCategoryStream(streamId, streamView, fetchOptions, fetchedAt));
            } else if (streamId === ALL_STREAM_ID) {
                stream = await dispatch(fetchAllStream(streamView, fetchOptions, fetchedAt));
            } else if (streamId === PINS_STREAM_ID) {
                stream = await dispatch(fetchPinsStream(streamView, fetchOptions, fetchedAt));
            }
        } catch (error) {
            dispatch({
                type: 'STREAM_FETCHING_FAILED',
                streamId,
                streamView,
                fetchOptions,
                fetchedAt
            });

            throw error;
        }

        if (stream) {
            dispatch({
                type: 'STREAM_FETCHED',
                stream
            });

            const urls = stream.entries
                .filter((entry) => !!entry.url)
                .map((entry) => entry.url);

            const expandedUrls = await dispatch(expandUrls(urls));

            await dispatch(fetchBookmarkCounts(expandedUrls));
        } else {
            dispatch({
                type: 'STREAM_FETCHED',
                stream: {
                    streamId,
                    title: 'Stream is not found',
                    fetchedAt: 0,
                    entries: [],
                    continuation: null,
                    feed: null,
                    category: null,
                    fetchOptions,
                    activeEntryIndex: -1,
                    expandedEntryIndex: -1,
                    readEntryIndex: -1,
                    heights: {},
                    streamView
                }
            } as Event);  // XXX: Avoid the bug? on TypeScript 2.8
        }
    };
}

export function fetchMoreEntries(streamId: string, continuation: string, fetchOptions: StreamFetchOptions): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'MORE_ENTRIES_FETCHING',
            streamId
        });

        let entries: Entry[] = [];

        try {
            const token = await dispatch(getFeedlyToken());
            const feedlyStreamId = toFeedlyStreamId(streamId, token.id);

            const contents = await feedlyApi.getStreamContents(token.access_token, {
                streamId: feedlyStreamId,
                continuation,
                count: fetchOptions.numEntries,
                ranked: fetchOptions.entryOrder,
                unreadOnly: fetchOptions.onlyUnread
            });

            entries = contents.items.map(convertEntry);

            dispatch({
                type: 'MORE_ENTRIES_FETCHED',
                streamId,
                entries,
                continuation: contents.continuation || null
            });
        } catch (error) {
            dispatch({
                type: 'MORE_ENTRIES_FETCHING_FAILED',
                streamId
            });

            throw error;
        }

        const urls = entries
            .filter((entry) => !!entry.url)
            .map((entry) => entry.url);

        const expandedUrls = await dispatch(expandUrls(urls));

        await dispatch(fetchBookmarkCounts(expandedUrls));
    };
}

export function fetchEntryComments(entryId: string | number, url: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'ENTRY_COMMENTS_FETCHING',
            entryId
        });

        try {
            const bookmarks = await bookmarkApi.getBookmarkEntry(url);

            const comments = (bookmarks && bookmarks.bookmarks ? bookmarks.bookmarks : [])
                .filter((bookmark) => bookmark.comment !== '')
                .map((bookmark) => ({
                    user: bookmark.user,
                    comment: bookmark.comment,
                    timestamp: bookmark.timestamp
                }));

            dispatch({
                type: 'ENTRY_COMMENTS_FETCHED',
                entryId,
                comments
            });
        } catch (error) {
            dispatch({
                type: 'ENTRY_COMMENTS_FETCHING_FAILED',
                entryId
            });

            throw error;
        }
    };
}

export function fetchFullContent(entryId: string | number, url: string): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'FULL_CONTENT_FETCHING',
            entryId
        });

        let content = '';
        let nextPageUrl = '';

        try {
            const response = await fetch(url, {
                mode: 'cors',
                credentials: 'include'
            });

            if (response.ok) {
                const responseText = await decodeResponseAsText(response);
                const parsedDocument = new DOMParser().parseFromString(responseText, 'text/html');
                const siteinfoItems = await dispatch(getSiteinfoItems());

                for (const item of siteinfoItems) {
                    if (tryMatch(item.urlPattern, response.url)) {
                        if (!content) {
                            content = extractContent(parsedDocument, response.url, item.contentExpression);
                        }

                        if (!nextPageUrl && item.nextLinkExpression) {
                            nextPageUrl = extractNextPageUrl(parsedDocument, response.url, item.nextLinkExpression);
                        }

                        if (content && nextPageUrl) {
                            break;
                        }
                    }
                }
            }

            if (content) {
                dispatch({
                    type: 'FULL_CONTENT_FETCHED',
                    entryId,
                    fullContent: {
                        url: response.url,
                        content,
                        nextPageUrl
                    }
                });
            } else {
                dispatch({
                    type: 'FULL_CONTENT_WAS_NOT_FOUND',
                    entryId
                });
            }
        } catch (error) {
            dispatch({
                type: 'FULL_CONTENT_FETCHING_FAILED',
                entryId
            });

            throw error;
        }
    };
}

export function updateEntryHeights(streamId: string, heights: { [ id: string ]: number }): Event {
    return {
        type: 'STREAM_ENTRY_HEIGHTS_UPDATED',
        streamId,
        heights
    };
}

export function clearStreamCaches(): Event {
    return {
        type: 'STREAM_CACHES_CLEARED'
    };
}

export function markAsRead(entries: Entry[]): AsyncThunk {
    return async ({ dispatch }) => {
        const entryIds = entries.map((entry) => entry.entryId as string);

        dispatch({
            type: 'ENTRIES_MARKING_AS_READ',
            entryIds
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedlyApi.markAsReadForEntries(token.access_token, entryIds);

            const readCounts = entries
                .reduce<{ [streamId: string]: number }>((acc, entry) => {
                    if (entry.origin) {
                        const { streamId } = entry.origin;
                        acc[streamId] = (acc[streamId] || 0) + 1;
                    }
                    return acc;
                }, {});

            dispatch({
                type: 'ENTRIES_MARKED_AS_READ',
                entryIds,
                readCounts
            });

            const message = entries.length === 1
                ? `${entries.length} entry is marked as read.`
                : `${entries.length} entries are marked as read.`;

            dispatch(sendNotification(
                message,
                'positive'
            ));
        } catch (error) {
            dispatch({
                type: 'ENTRIES_MARKING_AS_READ_FAILED',
                entryIds
            });

            throw error;
        }
    };
}

export function markAllAsRead(): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'ALL_ENTRIES_MARKING_AS_READ'
        });

        try {
            const token = await dispatch(getFeedlyToken());
            const categoryId = allStreamIdOf(token.id);

            await feedlyApi.markAsReadForCategories(token.access_token, categoryId);

            dispatch({
                type: 'ALL_ENTRIES_MARKED_AS_READ'
            });

            const { subscriptions } = getState();
            const numEntries = Object.values(subscriptions)
                .reduce((total, subscription) => total + subscription.unreadCount, 0);
            const message = numEntries === 1
                ? `${numEntries} entry is marked as read.`
                : `${numEntries} entries are marked as read.`;

            dispatch(sendNotification(
                message,
                'positive'
            ));
        } catch (error) {
            dispatch({
                type: 'ALL_ENTRIES_MARKING_AS_READ_FAILED'
            });

            throw error;
        }
    };
}

export function markFeedAsRead(subscription: Subscription): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'FEED_MARKING_AS_READ',
            feedId: subscription.feedId,
            streamId: subscription.streamId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedlyApi.markAsReadForFeeds(token.access_token, subscription.feedId as string);

            dispatch({
                type: 'FEED_MARKED_AS_READ',
                feedId: subscription.feedId,
                streamId: subscription.streamId
            });

            const numEntries = Math.max(0, subscription.unreadCount - subscription.readCount);
            const message = numEntries === 1
                ? `${numEntries} entry is marked as read.`
                : `${numEntries} entries are marked as read.`;

            dispatch(sendNotification(
                message,
                'positive'
            ));
        } catch (error) {
            dispatch({
                type: 'FEED_MARKING_AS_READ_FAILED',
                feedId: subscription.feedId,
                streamId: subscription.streamId
            });

            throw error;
        }
    };
}

export function markCategoryAsRead(category: Category): AsyncThunk {
    return async ({ dispatch, getState }) => {
        dispatch({
            type: 'CATEGORY_MARKING_AS_READ',
            categoryId: category.categoryId,
            streamId: category.streamId,
            label: category.label
        });

        try {
            const token = await dispatch(getFeedlyToken());

            await feedlyApi.markAsReadForCategories(token.access_token, category.categoryId as string);

            dispatch({
                type: 'CATEGORY_MARKED_AS_READ',
                categoryId: category.categoryId,
                streamId: category.streamId,
                label: category.label
            });

            const { subscriptions } = getState();
            const numEntries = Object.values(subscriptions.items).reduce(
                (total, subscription) => total + (subscription.labels.includes(category.label) ? subscription.unreadCount : 0),
                0
            );
            const message = numEntries === 1
                ? `${numEntries} entry is marked as read.`
                : `${numEntries} entries are marked as read.`;

            dispatch(sendNotification(
                message,
                'positive'
            ));
        } catch (error) {
            dispatch({
                type: 'CATEGORY_MARKING_AS_READ_FAILED',
                categoryId: category.categoryId,
                streamId: category.streamId,
                label: category.label
            });

            throw error;
        }
    };
}

export function pinEntry(entryId: string | number): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'ENTRY_PINNING',
            entryId
        });

        try {
            const token = await dispatch(getFeedlyToken());
            const tagId = pinsStreamIdOf(token.id);

            await feedlyApi.setTag(token.access_token, [entryId as string], [tagId]);

            dispatch({
                type: 'ENTRY_PINNED',
                entryId,
                isPinned: true
            });
        } catch (error) {
            dispatch({
                type: 'ENTRY_PINNING_FAILED',
                entryId
            });

            throw error;
        }
    };
}

export function unpinEntry(entryId: string | number): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'ENTRY_PINNING',
            entryId
        });

        try {
            const token = await dispatch(getFeedlyToken());
            const tagId = pinsStreamIdOf(token.id);

            await feedlyApi.unsetTag(token.access_token, [entryId as string], [tagId]);

            dispatch({
                type: 'ENTRY_PINNED',
                entryId,
                isPinned: false
            });
        } catch (error) {
            dispatch({
                type: 'ENTRY_PINNING_FAILED',
                entryId
            });

            throw error;
        }
    };
}

export function changeUnreadKeeping(keepUnread: boolean): Event {
    return {
        type: 'UNREAD_KEEPING_CHANGED',
        keepUnread
    };
}

export function changeDefaultStreamFetchOptions(fetchOptions: StreamFetchOptions): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'DEFAULT_STREAM_OPTIONS_CHANGED',
            fetchOptions
        });

        dispatch(sendNotification(
            'Default stream fetch options changed',
            'positive'
        ));
    };
}

export function changeDefaultStreamView(streamView: StreamViewKind): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'DEFAULT_STREAM_VIEW_CHANGED',
            streamView
        });

        dispatch(sendNotification(
            'Default stream view changed',
            'positive'
        ));
    };
}

export function changeStreamCacheCapacity(capacity: number): Thunk {
    return ({ dispatch }) => {
        dispatch({
            type: 'STREAM_CACHE_CAPACITY_CHANGED',
            capacity
        });

        dispatch(sendNotification(
            'Stream cache capacity changed',
            'positive'
        ));
    };
}

export function changeStreamCacheLifetime(lifetime: number): Thunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'STREAM_CACHE_LIFETIME_CHANGED',
            lifetime
        });

        dispatch(sendNotification(
            'Stream cache lifetime changed',
            'positive'
        ));
    };
}

export function showFullContents(entryId: string | number): Event {
    return {
        type: 'FULL_CONTENTS_SHOWN',
        entryId
    };
}

export function hideFullContents(entryId: string | number): Event {
    return {
        type: 'FULL_CONTENTS_HIDDEN',
        entryId
    };
}

export function showEntryComments(entryId: string | number): Event {
    return {
        type: 'ENTRY_COMMENTS_SHOWN',
        entryId
    };
}

export function hideEntryComments(entryId: string | number): Event {
    return {
        type: 'ENTRY_COMMENTS_HIDDEN',
        entryId
    };
}

export function changeStreamHistoryOptions(numStreamHistories: number): AsyncThunk {
    return async ({ dispatch }) => {
        dispatch({
            type: 'STREAM_HISTORY_OPTIONS_CHANGED',
            numStreamHistories
        });

        dispatch(sendNotification(
            'Stream history options changed',
            'positive'
        ));
    };
}

function fetchFeedStream(streamId: string, streamView: StreamViewKind, fetchOptions: StreamFetchOptions, fetchedAt: number): AsyncThunk<Stream> {
    return async ({ dispatch }) => {
        const token = await dispatch(getFeedlyToken());

        const [contents, feed] = await Promise.all([
            feedlyApi.getStreamContents(token.access_token, {
                streamId,
                count: fetchOptions.numEntries,
                ranked: fetchOptions.entryOrder,
                unreadOnly: fetchOptions.onlyUnread
            }),
            feedlyApi.getFeed(token.access_token, streamId)
        ]);

        const stream = {
            streamId,
            category: null,
            title: feed.title || feed.website || feed.id.replace(/^feed\//, ''),
            fetchedAt,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            feed: {
                feedId: feed.id,
                streamId: feed.id,
                title: feed.title,
                description: feed.description || '',
                url: feed.website || '',
                feedUrl: feed.id.replace(/^feed\//, ''),
                iconUrl: feed.iconUrl || '',
                subscribers: feed.subscribers || 0,
                isLoading: false
            },
            fetchOptions,
            activeEntryIndex: -1,
            expandedEntryIndex: -1,
            readEntryIndex: -1,
            heights: {},
            streamView
        };

        return stream;
    };
}

function fetchCategoryStream(streamId: string, streamView: StreamViewKind, fetchOptions: StreamFetchOptions, fetchedAt: number): AsyncThunk<Stream> {
    return async ({ dispatch, getState }) => {
        const token = await dispatch(getFeedlyToken());

        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId,
            count: fetchOptions.numEntries,
            ranked: fetchOptions.entryOrder,
            unreadOnly: fetchOptions.onlyUnread
        });

        const { categories } = getState();
        const category = categories.items[streamId] || null;

        const stream: Stream = {
            streamId,
            title: category ? category.label : '',
            fetchedAt,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            feed: null,
            fetchOptions,
            activeEntryIndex: -1,
            expandedEntryIndex: -1,
            readEntryIndex: -1,
            heights: {},
            streamView
        };

        return stream;
    };
}

function fetchAllStream(streamView: StreamViewKind, fetchOptions: StreamFetchOptions, fetchedAt: number): AsyncThunk<Stream> {
    return async ({ dispatch }) => {
        const token = await dispatch(getFeedlyToken());

        const streamId = allStreamIdOf(token.id);
        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId,
            count: fetchOptions.numEntries,
            ranked: fetchOptions.entryOrder,
            unreadOnly: fetchOptions.onlyUnread
        });

        const stream: Stream = {
            streamId: ALL_STREAM_ID,
            title: 'All',
            entries: contents.items.map(convertEntry),
            fetchedAt,
            continuation: contents.continuation || null,
            feed: null,
            fetchOptions,
            activeEntryIndex: -1,
            expandedEntryIndex: -1,
            readEntryIndex: -1,
            heights: {},
            streamView
        };

        dispatch({
            type: 'STREAM_FETCHED',
            stream
        });

        return stream;
    };
}

function fetchPinsStream(streamView: StreamViewKind, fetchOptions: StreamFetchOptions, fetchedAt: number): AsyncThunk<Stream> {
    return async ({ dispatch }) => {
        const token = await dispatch(getFeedlyToken());

        const streamId = pinsStreamIdOf(token.id);
        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId,
            count: fetchOptions.numEntries,
            ranked: fetchOptions.entryOrder,
            unreadOnly: fetchOptions.onlyUnread
        });

        const stream: Stream = {
            streamId: PINS_STREAM_ID,
            title: 'Pins',
            entries: contents.items.map(convertEntry),
            fetchedAt,
            continuation: contents.continuation || null,
            feed: null,
            fetchOptions,
            activeEntryIndex: -1,
            expandedEntryIndex: -1,
            readEntryIndex: -1,
            heights: {},
            streamView
        };

        dispatch({
            type: 'STREAM_FETCHED',
            stream
        });

        return stream;
    };
}

function fetchBookmarkCounts(urls: string[]): AsyncThunk {
    return async ({ dispatch }) => {
        if (urls.length > 0) {
            const bookmarkCounts = await bookmarkApi.getBookmarkCounts(urls);

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
        title: entry.title,
        author: entry.author || '',
        url,
        summary: stripTags((entry.summary ? entry.summary.content : '') || (entry.content ? entry.content.content : '')),
        content: (entry.content ? entry.content.content : '') || (entry.summary ? entry.summary.content : ''),
        publishedAt: entry.published,
        bookmarkCount: 0,
        isPinned: entry.tags ? entry.tags.some((tag) => tag.id.endsWith('tag/global.saved')) : false,
        isPinning: false,
        markedAsRead: !entry.unread,
        origin: entry.origin ? {
            streamId: entry.origin.streamId,
            title: entry.origin.title,
            url: entry.origin.htmlUrl
        } : null,
        fullContents: {
            isLoaded: false,
            isLoading: false,
            isNotFound: false,
            isShown: false,
            items: []
        },
        comments: {
            isLoaded: false,
            isLoading: false,
            isShown: false,
            items: []
        }
    };
}

function extractContent(contentDocument: Document, url: string, contentExpression: string): string {
    let content = '';

    const contentResult = tryEvaluate(
        contentDocument,
        contentExpression,
        contentDocument.body,
        null,
        XPathResult.ORDERED_NODE_ITERATOR_TYPE,
        null
    );

    if (contentResult) {
        for (
            let node = contentResult.iterateNext();
            node;
            node = contentResult.iterateNext()
        ) {
            if (node instanceof Element) {
                content += node.outerHTML;
            }
        }
    }

    return content;
}

function extractNextPageUrl(contentDocument: Document, url: string, nextLinkExpression: string): string {
    const nextLinkResult = tryEvaluate(
        contentDocument,
        nextLinkExpression,
        contentDocument.body,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    );

    if (nextLinkResult && nextLinkResult.singleNodeValue instanceof Element) {
        const href = nextLinkResult.singleNodeValue.getAttribute('href');

        if (href) {
            return new URL(href, url).toString();
        }
    }

    return '';
}

function tryEvaluate(document: Document, expression: string, contextNode: Node, resolver: XPathNSResolver | null, type: number, result: XPathResult | null): XPathResult | null {
    try {
        return document.evaluate(expression, contextNode, resolver, type, result);
    } catch (_error) {
        return null;
    }
}

function expandUrls(urls: string[]): AsyncThunk<string[]> {
    return async ({ dispatch, getState }) => {
        const { trackingUrls } = getState();
        const matchedUrls = urls
            .filter((url) => trackingUrls.patterns.some((pattern) => tryMatch(pattern, url)));

        if (matchedUrls.length === 0) {
            return urls;
        }

        const queue = new PromiseQueue<{ originalUrl: string, expandedUrl: string }>(8);

        for (const url of matchedUrls) {
            queue.enqueue(() => dispatch(expandUrl(url)));
        }

        const { results } = await queue.getResults();
        const expandedUrls = results.reduce<{ [key: string]: string }>((acc, { originalUrl, expandedUrl }) => {
            acc[originalUrl] = expandedUrl;
            return acc;
        }, {});

        dispatch({
            type: 'ENTRY_URLS_EXPANDED',
            urls: expandedUrls
        });

        return urls.map((url) => expandedUrls[url] || url);
    };
}

function toFeedlyStreamId(streamId: string, uid: string): string {
    switch (streamId) {
        case ALL_STREAM_ID:
            return allStreamIdOf(uid);
        case PINS_STREAM_ID:
            return pinsStreamIdOf(uid);
        default:
            return streamId;
    }
}

function allStreamIdOf(uid: string): string {
    return `user/${uid}/category/global.all`;
}

function pinsStreamIdOf(uid: string): string {
    return `user/${uid}/tag/global.saved`;
}
