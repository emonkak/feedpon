import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';

import * as feedly from 'adapters/feedly/types';
import decodeResponseAsText from 'utils/decodeResponseAsText';
import stripTags from 'utils/stripTags';
import { AsyncEvent, Entry, Feed, FeedSpecification, FeedView, FullContent, Siteinfo, SyncEvent } from 'messaging/types';
import { DEFAULT_DISMISS_AFTER, sendNotification } from 'messaging/notification/actions';
import { getBookmarkCounts, getBookmarkEntry } from 'adapters/hatena/bookmarkApi';
import { getCredential } from 'messaging/credential/actions';
import { getFeed, getStreamContents } from 'adapters/feedly/api';

const URL_PATTERN = /^https?:\/\//;

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

function matches(pattern: string, str: string): boolean {
    try {
        return new RegExp(pattern).test(str);
    } catch (error) {
        return false;
    }
}

export function changeFeedView(view: FeedView): SyncEvent {
    return {
        type: 'FEED_VIEW_CHANGED',
        view
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
