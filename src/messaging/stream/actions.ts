import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

import * as feedly from 'adapters/feedly/types';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import stripTags from 'utils/stripTags';
import { AsyncEvent, Entry, FullContent, SiteinfoItem, StreamOptions, StreamView, SyncEvent } from 'messaging/types';
import { DEFAULT_DISMISS_AFTER, sendNotification } from 'messaging/notification/actions';
import { getBookmarkCounts, getBookmarkEntry } from 'adapters/hatena/bookmarkApi';
import { getCredential } from 'messaging/credential/actions';
import { getFeed, getStreamContents } from 'adapters/feedly/api';

const URL_PATTERN = /^https?:\/\//;

export function changeStreamView(view: StreamView): SyncEvent {
    return {
        type: 'STREAM_VIEW_CHANGED',
        view
    };
}

export function fetchStream(streamId: string, options?: StreamOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId
        });

        const { preference } = getState();

        if (!options) {
            options = {
                numEntries: preference.defaultNumEntries,
                order: preference.defaultEntryOrder,
                onlyUnread: preference.onlyUnreadEntries,
                view: preference.defaultStreamView
            };
        }

        if (streamId.startsWith('feed/')) {
            await fetchFeedStream(streamId, options)(dispatch, getState);
        } else if (streamId.startsWith('user/')) {
            await fetchCategoryStream(streamId, options)(dispatch, getState);
        } else if (streamId === 'all') {
            await fetchAllStream(options)(dispatch, getState);
        } else if (streamId === 'pins') {
            await fetchPinsStream(options)(dispatch, getState);
        }
    };
}

export function fetchMoreEntries(streamId: string, continuation: string, options: StreamOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        dispatch({
            type: 'MORE_ENTRIES_FETCHING',
            streamId
        });

        const credential = await getCredential()(dispatch, getState);

        const feedlyStreamId = toFeedlyStreamId(streamId, credential.token.id);
        const contentsResponse = await getStreamContents(credential.token.access_token, {
            streamId: feedlyStreamId,
            continuation,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        dispatch({
            type: 'MORE_ENTRIES_FETCHED',
            streamId,
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

function fetchFeedStream(streamId: string, options: StreamOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);
        const [contents, feed] = await Promise.all([
            getStreamContents(credential.token.access_token, {
                streamId,
                ranked: options.order,
                unreadOnly: options.onlyUnread
            }),
            getFeed(credential.token.access_token, streamId)
        ]);

        const { subscriptions } = getState();
        const subscription = new Enumerable(subscriptions.items)
            .firstOrDefault((subscription) => subscription.subscriptionId === streamId);

        const stream = {
            streamId,
            title: feed.title,
            entries: contents.items.map(convertEntry),
            continuation: contents.continuation || null,
            unreadCount: subscription ? subscription.unreadCount : 0,
            isLoading: false,
            isLoaded: true,
            feed: {
                description: feed.description || '',
                subscribers: feed.subscribers,
                url: feed.website || '',
                velocity: feed.velocity || 0,
            },
            subscription,
            options
        };

        dispatch({
            type: 'STREAM_FETCHED',
            stream
        });

        fetchBookmarkCounts(stream.entries)(dispatch, getState);
    };
}

function fetchCategoryStream(streamId: string, options: StreamOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);
        const contents = await getStreamContents(credential.token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const { subscriptions } = getState();

        const category = new Enumerable(subscriptions.categories)
            .firstOrDefault((category) => category.categoryId === streamId);

        const stream = {
            streamId,
            title: category ? category.label : '',
            entries: contents.items.map(convertEntry),
            unreadCount: category ? category.unreadCount : 0,
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            feed: null,
            subscription: null,
            options
        };

        dispatch({
            type: 'STREAM_FETCHED',
            stream
        });

        fetchBookmarkCounts(stream.entries)(dispatch, getState);
    };
}

function fetchAllStream(options: StreamOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);
        const streamId = toFeedlyStreamId('all', credential.token.id);
        const contents = await getStreamContents(credential.token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const { subscriptions } = getState();

        const stream = {
            streamId: 'all',
            title: 'All',
            entries: contents.items.map(convertEntry),
            unreadCount: subscriptions.totalUnreadCount,
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            feed: null,
            subscription: null,
            options
        }

        dispatch({
            type: 'STREAM_FETCHED',
            stream
        });

        fetchBookmarkCounts(stream.entries)(dispatch, getState);
    };
}

function fetchPinsStream(options: StreamOptions): AsyncEvent<void> {
    return async (dispatch, getState) => {
        const credential = await getCredential()(dispatch, getState);

        const streamId = toFeedlyStreamId('pins', credential.token.id);
        const contents = await getStreamContents(credential.token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const stream = {
            streamId: 'pins',
            title: 'Pins',
            entries: contents.items.map(convertEntry),
            unreadCount: 0,
            continuation: contents.continuation || null,
            isLoading: false,
            isLoaded: true,
            feed: null,
            subscription: null,
            options
        };

        dispatch({
            type: 'STREAM_FETCHED',
            stream
        });

        fetchBookmarkCounts(stream.entries)(dispatch, getState);
    };
}

function fetchBookmarkCounts(entries: Entry[]): AsyncEvent<void> {
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
            streamId: entry.origin.streamId,
            title: entry.origin.title,
            url: entry.origin.htmlUrl,
        } : null,
        markedAsRead: !entry.unread
    };
}

function tryMatch(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str);
    } catch (error) {
        return false;
    }
}

function toFeedlyStreamId(streamId: string, uid: string) {
    if (streamId === 'all') {
        return 'user/' + uid + '/category/global.all';
    }
    if (streamId === 'all') {
        return 'user/' + uid + '/tag/global.saved';
    }
    return streamId;
}
