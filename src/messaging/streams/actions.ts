import * as bookmarkApi from 'adapters/hatena/bookmarkApi';
import * as feedly from 'adapters/feedly/types';
import * as feedlyApi from 'adapters/feedly/api';
import PromiseQueue from 'utils/PromiseQueue';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import stripTags from 'utils/stripTags';
import { AsyncEvent, Entry, Event, Stream, StreamOptions, StreamView } from 'messaging/types';
import { getFeedlyToken } from 'messaging/credential/actions';
import { getSiteinfoItems } from 'messaging/siteinfo/actions';
import { sendNotification } from 'messaging/notifications/actions';

export function changeStreamView(streamId: string, view: StreamView): Event {
    return {
        type: 'STREAM_VIEW_CHANGED',
        streamId,
        view
    };
}

export function fetchStream(streamId: string, options?: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
        if (!options) {
            const { streamSettings } = getState();

            options = {
                numEntries: streamSettings.defaultNumEntries,
                order: streamSettings.defaultEntryOrder,
                onlyUnread: streamSettings.onlyUnreadEntries,
                view: streamSettings.defaultStreamView
            };
        }

        let stream = null;

        if (streamId.startsWith('feed/')) {
            stream = await dispatch(fetchFeedStream(streamId, options));
        } else if (streamId.startsWith('user/')) {
            stream = await dispatch(fetchCategoryStream(streamId, options));
        } else if (streamId === 'all') {
            stream = await dispatch(fetchAllStream(options));
        } else if (streamId === 'pins') {
            stream = await dispatch(fetchPinsStream(options));
        }

        if (stream) {
            const urls = stream.entries
                .filter((entry) => !!entry.url)
                .map((entry) => entry.url);

            const expandedUrls = await dispatch(expandUrls(urls));

            await dispatch(fetchBookmarkCounts(expandedUrls));
        }
    };
}

export function fetchMoreEntries(streamId: string, continuation: string, options: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
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
                ranked: options.order,
                unreadOnly: options.onlyUnread
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

function fetchFeedStream(streamId: string, options: StreamOptions): AsyncEvent<Stream> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const [contents, feed] = await Promise.all([
                feedlyApi.getStreamContents(token.access_token, {
                    streamId,
                    ranked: options.order,
                    unreadOnly: options.onlyUnread
                }),
                feedlyApi.getFeed(token.access_token, streamId)
            ]);

            const stream = {
                streamId,
                title: feed.title,
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
                    subscribers: feed.subscribers,
                    isLoading: false,
                },
                options
            };

            dispatch({
                type: 'STREAM_FETCHED',
                stream
            });

            return stream;
        } catch (error) {
            dispatch({
                type: 'STREAM_FETCHING_FAILED',
                streamId
            });

            throw error;
        }
    };
}

function fetchCategoryStream(streamId: string, options: StreamOptions): AsyncEvent<Stream> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const contents = await feedlyApi.getStreamContents(token.access_token, {
                streamId,
                ranked: options.order,
                unreadOnly: options.onlyUnread
            });

            const { categories } = getState();
            const category = categories.items
                .find((category) => category.streamId === streamId) || null;

            const stream = {
                streamId,
                title: category ? category.label : '',
                entries: contents.items.map(convertEntry),
                continuation: contents.continuation || null,
                feed: null,
                options
            };

            dispatch({
                type: 'STREAM_FETCHED',
                stream
            });

            return stream;
        } catch (error) {
            dispatch({
                type: 'STREAM_FETCHING_FAILED',
                streamId
            });

            throw error;
        }
    };
}

function fetchAllStream(options: StreamOptions): AsyncEvent<Stream> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId: 'all'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const streamId = toFeedlyStreamId('all', token.id);
            const contents = await feedlyApi.getStreamContents(token.access_token, {
                streamId,
                ranked: options.order,
                unreadOnly: options.onlyUnread
            });

            const stream = {
                streamId: 'all',
                title: 'All',
                entries: contents.items.map(convertEntry),
                continuation: contents.continuation || null,
                feed: null,
                options
            };

            dispatch({
                type: 'STREAM_FETCHED',
                stream
            });

            return stream;
        } catch (error) {
            dispatch({
                type: 'STREAM_FETCHING_FAILED',
                streamId: 'all'
            });

            throw error;
        }
    };
}

function fetchPinsStream(options: StreamOptions): AsyncEvent<Stream> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId: 'pins'
        });

        try {
            const token = await dispatch(getFeedlyToken());

            const streamId = toFeedlyStreamId('pins', token.id);
            const contents = await feedlyApi.getStreamContents(token.access_token, {
                streamId,
                ranked: options.order,
                unreadOnly: options.onlyUnread
            });

            const stream = {
                type: 'STREAM_FETCHED',
                streamId: 'pins',
                title: 'Pins',
                entries: contents.items.map(convertEntry),
                continuation: contents.continuation || null,
                feed: null,
                options
            };

            dispatch({
                type: 'STREAM_FETCHED',
                stream
            });

            return stream;
        } catch (error) {
            dispatch({
                type: 'STREAM_FETCHING_FAILED',
                streamId: 'pins'
            });

            throw error;
        }
    };
}

function fetchBookmarkCounts(urls: string[]): AsyncEvent {
    return async (dispatch, getState) => {
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
            items: []
        },
        comments: {
            isLoaded: false,
            isLoading: false,
            items: []
        }
    };
}

export function fetchComments(entryId: string, url: string): AsyncEvent {
    return async (dispatch) => {
        dispatch({
            type: 'COMMENTS_FETCHING',
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
                type: 'COMMENTS_FETCHED',
                entryId,
                comments
            });
        } catch (error) {
            dispatch({
                type: 'COMMENTS_FETCHING_FAILED',
                entryId
            });

            throw error;
        }
    };
}

export function fetchFullContent(entryId: string, url: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FULL_CONTENT_FETCHING',
            entryId
        });

        let content = '';
        let nextPageUrl = '';

        try {
            const response = await fetch(url);

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
                    type: 'FULL_CONTENT_FETCHING_FAILED',
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

function extractContent(contentDocument: Document, url: string, contentExpression: string): string {
    let content = '';

    const contentResult = tryEvaluate(
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

export function markAsRead(entryIds: (string | number)[]): AsyncEvent {
    return async (dispatch, getState) => {
        if (entryIds.length === 0) {
            return;
        }

        // TODO: Implementation

        setTimeout(() => {
            const message = entryIds.length === 1
                ? `${entryIds.length} entry is marked as read.`
                : `${entryIds.length} entries are marked as read.`;

            dispatch({
                type: 'ENTRY_MARKED_AS_READ',
                entryIds
            });

            dispatch(sendNotification(
                message,
                'positive'
            ));
        }, 200);
    };
}

export function pinEntry(entryId: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'ENTRY_PINNING',
            entryId
        });

        try {
            const token = await dispatch(getFeedlyToken());
            const tagId = toFeedlyStreamId('pins', token.id);

            await feedlyApi.setTag(token.access_token, [entryId], [tagId]);

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

export function unpinEntry(entryId: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'ENTRY_PINNING',
            entryId
        });

        try {
            const token = await dispatch(getFeedlyToken());
            const tagId = toFeedlyStreamId('pins', token.id);

            await feedlyApi.unsetTag(token.access_token, [entryId], [tagId]);

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

function expandUrls(urls: string[]): AsyncEvent<string[]> {
    return async (dispatch, getState) => {
        const { trackingUrlSettings: { patterns } } = getState();
        const trackingUrls = urls
            .filter((url) => patterns.some((pattern) => tryMatch(pattern, url)));

        if (trackingUrls.length === 0) {
            return urls;
        }

        const queue = new PromiseQueue(8);
        const cache = await caches.open('trackingUrls');

        for (const url of trackingUrls) {
            queue.enqueue(async () => {
                const request = new Request(url, {
                    method: 'HEAD'
                });

                const cachedResponse = await cache.match(request, {
                    ignoreMethod: true
                });
                if (cachedResponse) {
                    return { url, redirectUrl: cachedResponse.url };
                } 

                const response = await fetch(request);
                await cache.put(url, response);

                return { url, redirectUrl: response.url };
            });
        }

        const { results } = await queue.getResults();
        const expandedUrls = results.reduce<{ [key: string]: string }>((acc, { url, redirectUrl }) => {
            acc[url] = redirectUrl;
            return acc;
        }, {});

        dispatch({
            type: 'ENTRY_URLS_EXPANDED',
            urls: expandedUrls
        });

        return urls.map(url => expandedUrls[url] || url);
    };
}

function tryMatch(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str);
    } catch (error) {
        return false;
    }
}

function tryEvaluate(expression: string, contextNode: Node, resolver: XPathNSResolver | null, type: number, result: XPathResult | null): XPathResult | null {
    try {
        return document.evaluate(expression, contextNode, resolver, type, result);
    } catch (_error) {
        return null;
    }
}

function toFeedlyStreamId(streamId: string, uid: string): string {
    switch (streamId) {
        case 'all':
            return `user/${uid}/category/global.all`;
        case 'pins':
            return `user/${uid}/tag/global.saved`;
        default:
            return streamId;
    }
}
