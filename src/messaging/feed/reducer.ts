import initialState from 'messaging/initialState';
import { Feed, SyncEvent } from 'messaging/types';

export default function reducer(feed: Feed, event: SyncEvent): Feed {
    switch (event.type) {
        case 'BOOKMARK_COUNTS_FETCHED':
            return {
                ...feed,
                entries: feed.entries.map(entry => ({
                    ...entry,
                    bookmarkCount: event.bookmarkCounts[entry.url] || 0
                }))
            };

        case 'COMMENTS_FETCHED':
            return {
                ...feed,
                entries: feed.entries.map(entry => {
                    if (entry.entryId === event.entryId) {
                        return {
                            ...entry,
                            comments: {
                                items: event.comments,
                                isLoaded: true
                            }
                        };
                    }

                    return entry;
                })
            };


        case 'FEED_FETCHING':
            if (feed.feedId !== event.feedId) {
                return {
                    ...initialState.feed,
                    feedId: event.feedId,
                    isLoading: true,
                    isLoaded: false
                };
            }

            return {
                ...feed,
                isLoading: true,
                isLoaded: false
            };

        case 'FEED_FETCHED':
            return event.feed;

        case 'FULL_CONTENT_FETCHING':
            return {
                ...feed,
                entries: feed.entries.map(entry => {
                    if (entry.entryId !== event.entryId) {
                        return entry;
                    }

                    return {
                        ...entry,
                        fullContents: {
                            ...entry.fullContents,
                            isLoading: true
                        }
                    };
                })
            };

        case 'FULL_CONTENT_FETCHED':
            return {
                ...feed,
                entries: feed.entries.map(entry => {
                    if (entry.entryId !== event.entryId) {
                        return entry;
                    }

                    return {
                        ...entry,
                        fullContents: {
                            isLoaded: true,
                            isLoading: false,
                            items: event.fullContent ? entry.fullContents.items.concat([event.fullContent]) : entry.fullContents.items,
                            nextPageUrl: event.nextPageUrl
                        }
                    };
                })
            };

        case 'FEED_VIEW_CHANGED':
            return {
                ...feed,
                view: event.view
            };

        case 'MORE_ENTRIES_FETCHING':
            if (feed.feedId !== event.feedId) {
                return feed;
            }

            return {
                ...feed,
                isLoading: true
            };

        case 'MORE_ENTRIES_FETCHED':
            if (feed.feedId !== event.feedId) {
                return feed;
            }

            return {
                ...feed,
                continuation: event.continuation,
                entries: feed.entries.concat(event.entries),
                isLoading: false
            };

        case 'ENTRY_MARKED_AS_READ':
            return {
                ...feed,
                entries: feed.entries.map(entry => {
                    if (event.entryIds.indexOf(entry.entryId) === -1) {
                        return entry;
                    }

                    return {
                        ...entry,
                        markAsRead: true
                    };
                })
            };

        default:
            return feed;
    }
}
