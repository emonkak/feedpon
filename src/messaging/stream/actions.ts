import * as bookmarkApi from 'adapters/hatena/bookmarkApi';
import * as feedly from 'adapters/feedly/types';
import * as feedlyApi from 'adapters/feedly/api';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import stripTags from 'utils/stripTags';
import { AsyncEvent, Entry, Event, FullContent, StreamOptions, StreamView } from 'messaging/types';
import { getFeedlyToken } from 'messaging/credential/actions';
import { sendNotification } from 'messaging/notification/actions';

const URL_PATTERN = /^https?:\/\//;

export function changeStreamView(view: StreamView): Event {
    return {
        type: 'STREAM_VIEW_CHANGED',
        view
    };
}

export function fetchStream(streamId: string, options?: StreamOptions): AsyncEvent {
    return (dispatch, getState) => {
        if (!options) {
            const { settings } = getState();

            options = {
                numEntries: settings.defaultNumEntries,
                order: settings.defaultEntryOrder,
                onlyUnread: settings.onlyUnreadEntries,
                view: settings.defaultStreamView
            };
        }

        if (streamId.startsWith('feed/')) {
            dispatch(fetchFeedStream(streamId, options));
        } else if (streamId.startsWith('user/')) {
            dispatch(fetchCategoryStream(streamId, options));
        } else if (streamId === 'all') {
            dispatch(fetchAllStream(options));
        } else if (streamId === 'pins') {
            dispatch(fetchPinsStream(options));
        }
    };
}

export function fetchMoreEntries(streamId: string, continuation: string, options: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'MORE_ENTRIES_FETCHING',
            streamId
        });

        const token = await dispatch(getFeedlyToken());
        const feedlyStreamId = toFeedlyStreamId(streamId, token.id);

        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId: feedlyStreamId,
            continuation,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const entries = contents.items.map(convertEntry);

        dispatch({
            type: 'MORE_ENTRIES_FETCHED',
            streamId,
            entries,
            continuation: contents.continuation || null
        });

        dispatch(fetchBookmarkCounts(entries));
    };
}

function fetchFeedStream(streamId: string, options: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId
        });

        const token = await dispatch(getFeedlyToken());

        const [contents, feed] = await Promise.all([
            feedlyApi.getStreamContents(token.access_token, {
                streamId,
                ranked: options.order,
                unreadOnly: options.onlyUnread
            }),
            feedlyApi.getFeed(token.access_token, streamId)
        ]);

        const { subscriptions } = getState();
        const subscription = subscriptions.items
            .find((subscription) => subscription.streamId === streamId) || null;
        const entries = contents.items.map(convertEntry);

        dispatch({
            type: 'STREAM_FETCHED',
            streamId,
            title: feed.title,
            entries,
            continuation: contents.continuation || null,
            feed: {
                feedId: feed.id,
                streamId: feed.id,
                title: feed.title,
                description: feed.description || '',
                url: feed.website || '',
                iconUrl: feed.iconUrl || '',
                subscribers: feed.subscribers,
                isSubscribing: false
            },
            subscription,
            options
        });

        dispatch(fetchBookmarkCounts(entries));
    };
}

function fetchCategoryStream(streamId: string, options: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId
        });

        const token = await dispatch(getFeedlyToken());

        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });

        const { subscriptions } = getState();
        const category = subscriptions.categories
            .find((category) => category.streamId === streamId) || null;
        const entries = contents.items.map(convertEntry);

        dispatch({
            type: 'STREAM_FETCHED',
            streamId,
            title: category ? category.label : '',
            entries,
            continuation: contents.continuation || null,
            feed: null,
            subscription: null,
            options
        });

        dispatch(fetchBookmarkCounts(entries));
    };
}

function fetchAllStream(options: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId: 'all'
        });

        const token = await dispatch(getFeedlyToken());

        const streamId = toFeedlyStreamId('all', token.id);
        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });
        const entries = contents.items.map(convertEntry);

        dispatch({
            type: 'STREAM_FETCHED',
            streamId: 'all',
            title: 'All',
            entries,
            continuation: contents.continuation || null,
            feed: null,
            subscription: null,
            options
        });

        dispatch(fetchBookmarkCounts(entries));
    };
}

function fetchPinsStream(options: StreamOptions): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'STREAM_FETCHING',
            streamId: 'pins'
        });

        const token = await dispatch(getFeedlyToken());

        const streamId = toFeedlyStreamId('pins', token.id);
        const contents = await feedlyApi.getStreamContents(token.access_token, {
            streamId,
            ranked: options.order,
            unreadOnly: options.onlyUnread
        });
        const entries = contents.items.map(convertEntry);

        dispatch({
            type: 'STREAM_FETCHED',
            streamId: 'pins',
            title: 'Pins',
            entries,
            continuation: contents.continuation || null,
            feed: null,
            subscription: null,
            options
        });

        dispatch(fetchBookmarkCounts(entries));
    };
}

function fetchBookmarkCounts(entries: Entry[]): AsyncEvent {
    return async (dispatch, getState) => {
        const entryUrls = entries
            .filter((entry) => !!entry.url)
            .map((entry) => entry.url);

        if (entryUrls.length > 0) {
            const bookmarkCounts = await bookmarkApi.getBookmarkCounts(entryUrls);

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
        publishedAt: new Date(entry.published).toISOString(),
        bookmarkUrl: 'http://b.hatena.ne.jp/entry/' + url,
        bookmarkCount: 0,
        isPinned: entry.tags ? entry.tags.some((tag) => tag.id.endsWith('tag/global.saved')) : false,
        isPinning: false,
        markedAsRead: !entry.unread,
        origin: entry.origin ? {
            streamId: entry.origin.streamId,
            title: entry.origin.title,
            url: entry.origin.htmlUrl
        } : null,
        visual: entry.visual && URL_PATTERN.test(entry.visual.url) ? {
            url: entry.visual.url,
            width: entry.visual.width,
            height: entry.visual.height
        } : null,
        fullContents: {
            isLoaded: false,
            isLoading: false,
            items: []
        },
        comments: {
            isLoaded: false,
            items: []
        }
    };
}

export function fetchComments(entryId: string, url: string): AsyncEvent {
    return async (dispatch) => {
        const bookmarks = await bookmarkApi.getBookmarkEntry(url);

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
    };
}

export function fetchFullContent(entryId: string, url: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'FULL_CONTENT_FETCHING',
            entryId
        });

        const response = await fetch(url);

        if (response.ok) {
            const responseText = await decodeResponseAsText(response);
            const responseUrl = response.url;

            const { siteinfo } = getState();

            const parser = new DOMParser();
            const parsedDocument = parser.parseFromString(responseText, 'text/html');

            let fullContent = null;

            for (const item of siteinfo.userItems.concat(siteinfo.items)) {
                if (tryMatch(item.urlPattern, responseUrl)) {
                    try {
                        fullContent = extractFullContent(parsedDocument, responseUrl, item.contentPath, item.nextLinkPath);

                        if (fullContent !== null) {
                            break;
                        }
                    } catch (e) {
                    }
                }
            }

            dispatch({
                type: 'FULL_CONTENT_FETCHED',
                entryId,
                fullContent
            });
        }
    };
}

function extractFullContent(
    contentDocument: Document,
    url: string,
    contentPath: string,
    nextLinkPath: string | null
): FullContent | null {
    let content = '';

    const contentResult = document.evaluate(
        contentPath,
        contentDocument.body,
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
        let nextPageUrl: string | null = null;

        if (nextLinkPath) {
            const nextLinkResult = document.evaluate(
                nextLinkPath,
                contentDocument.body,
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

        return { content, url, nextPageUrl };
    }

    return null;
}

export function markAsRead(entryIds: (string | number)[]): AsyncEvent {
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

        const token = await dispatch(getFeedlyToken());
        const tagId = toFeedlyStreamId('pins', token.id);

        await feedlyApi.setTag(token.access_token, [entryId], [tagId]);

        dispatch({
            type: 'ENTRY_PINNED',
            entryId,
            isPinned: true
        });
    };
}

export function unpinEntry(entryId: string): AsyncEvent {
    return async (dispatch, getState) => {
        dispatch({
            type: 'ENTRY_PINNING',
            entryId
        });

        const token = await dispatch(getFeedlyToken());
        const tagId = toFeedlyStreamId('pins', token.id);

        await feedlyApi.unsetTag(token.access_token, [entryId], [tagId]);

        dispatch({
            type: 'ENTRY_PINNED',
            entryId,
            isPinned: false
        });
    };
}

function tryMatch(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str);
    } catch (error) {
        return false;
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
