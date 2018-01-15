import * as CacheMap from 'utils/containers/CacheMap';
import { Event, Streams } from 'messaging/types';

export default function reducer(streams: Streams, event: Event): Streams {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...streams,
                isLoading: false,
                isMarking: false,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    feed: stream.feed ? {
                        ...stream.feed,
                        isLoading: false
                    } : null,
                    entries: stream.entries.map((entry) => {
                        if (!(entry.isPinning || entry.comments.isLoading || entry.fullContents.isLoading)) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: false,
                            comments: {
                                ...entry.comments,
                                isLoading: false
                            },
                            fullContents: {
                                ...entry.fullContents,
                                isLoading: false
                            }
                        };
                    }),
                    readEntryIndex: stream.readEntryIndex != null ? stream.readEntryIndex : -1
                }))
            };

        case 'ACTIVE_ENTRY_CAHNGED':
            return {
                ...streams,
                items: CacheMap.update(streams.items, event.streamId, (stream) => {
                    return {
                        ...stream,
                        readEntryIndex: event.index > stream.readEntryIndex ? event.index - 1 : stream.readEntryIndex
                    };
                })
            };

        case 'READ_ENTRY_RESET':
            return {
                ...streams,
                items: CacheMap.update(streams.items, event.streamId, (stream) => {
                    return {
                        ...stream,
                        readEntryIndex: -1
                    };
                })
            };

        case 'STREAM_FETCHING':
            return {
                ...streams,
                isLoaded: false,
                isLoading: true,
                items: CacheMap.set(streams.items, event.streamId, {
                    streamId: event.streamId,
                    title: 'Loading...',
                    fetchedAt: event.fetchedAt,
                    entries: [],
                    continuation: null,
                    feed: null,
                    fetchOptions: event.fetchOptions,
                    readEntryIndex: -1,
                    heightCache: {}
                })
            };

        case 'STREAM_FETCHING_FAILED':
            return {
                ...streams,
                isLoaded: true,
                isLoading: false,
                items: CacheMap.set(streams.items, event.streamId, {
                    streamId: event.streamId,
                    title: 'Failed to fetch',
                    fetchedAt: event.fetchedAt,
                    entries: [],
                    continuation: null,
                    feed: null,
                    fetchOptions: event.fetchOptions,
                    readEntryIndex: -1,
                    heightCache: {}
                })
            };

        case 'STREAM_FETCHED':
            return {
                ...streams,
                isLoaded: true,
                isLoading: false,
                items: CacheMap.set(streams.items, event.stream.streamId, event.stream)
            };

        case 'STREAM_CACHES_CLEARED':
            return {
                ...streams,
                items: CacheMap.empty(streams.items.capacity)
            };

        case 'STREAM_HEIGHT_CACHE_UPDATED':
            return {
                ...streams,
                items: CacheMap.update(streams.items, event.streamId, (stream) => {
                    return {
                        ...stream,
                        heightCache: event.heights
                    };
                })
            };

        case 'MORE_ENTRIES_FETCHING':
            return {
                ...streams,
                isLoading: true
            };

        case 'MORE_ENTRIES_FETCHING_FAILED':
            return {
                ...streams,
                isLoading: false
            };

        case 'MORE_ENTRIES_FETCHED':
            return {
                ...streams,
                isLoading: false,
                items: CacheMap.update(streams.items, event.streamId, (stream) => ({
                    ...stream,
                    continuation: event.continuation,
                    entries: stream.entries.concat(event.entries)
                }))
            };

        case 'ENTRY_PINNING':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: true
                        };
                    })
                }))
            };

        case 'ENTRY_PINNING_FAILED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: false
                        };
                    })
                }))
            };

        case 'ENTRY_PINNED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: false,
                            isPinned: event.isPinned
                        };
                    })
                }))
            };

        case 'ENTRY_URLS_EXPANDED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (!event.urls[entry.url]) {
                            return entry;
                        }
                        return {
                            ...entry,
                            url: event.urls[entry.url]
                        };
                    })
                }))
            };

        case 'FEED_SUBSCRIBING':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => {
                    if (!stream.feed || stream.feed.feedId !== event.feedId) {
                        return stream;
                    }
                    return {
                        ...stream,
                        feed: {
                            ...stream.feed,
                            isLoading: true
                        }
                    };
                })
            };

        case 'FEED_SUBSCRIBING_FAILED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => {
                    if (!stream.feed || stream.feed.feedId !== event.feedId) {
                        return stream;
                    }
                    return {
                        ...stream,
                        feed: {
                            ...stream.feed,
                            isLoading: false
                        }
                    };
                })
            };

        case 'FEED_SUBSCRIBED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => {
                    if (!stream.feed || stream.feed.feedId !== event.subscription.feedId) {
                        return stream;
                    }
                    return {
                        ...stream,
                        feed: {
                            ...stream.feed,
                            isLoading: false
                        }
                    };
                })
            };

        case 'FEED_UNSUBSCRIBING':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => {
                    if (!stream.feed || stream.feed.feedId !== event.feedId) {
                        return stream;
                    }
                    return {
                        ...stream,
                        feed: {
                            ...stream.feed,
                            isLoading: true
                        }
                    };
                })
            };

        case 'FEED_UNSUBSCRIBING_FAILED':
        case 'FEED_UNSUBSCRIBED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => {
                    if (!stream.feed || stream.feed.feedId !== event.feedId) {
                        return stream;
                    }
                    return {
                        ...stream,
                        feed: {
                            ...stream.feed,
                            isLoading: false
                        }
                    };
                })
            };

        case 'FULL_CONTENT_FETCHING':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
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
                }))
            };

        case 'FULL_CONTENT_FETCHING_FAILED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                ...entry.fullContents,
                                isLoading: false
                            }
                        };
                    })
                }))
            };

        case 'FULL_CONTENT_FETCHED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                isLoaded: true,
                                isLoading: false,
                                isNotFound: false,
                                isShown: true,
                                items: [...entry.fullContents.items, event.fullContent]
                            }
                        };
                    })
                }))
            };

        case 'FULL_CONTENT_WAS_NOT_FOUND':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                ...entry.fullContents,
                                isLoaded: true,
                                isLoading: false,
                                isNotFound: true,
                                isShown: true
                            }
                        };
                    })
                }))
            };

        case 'FULL_CONTENTS_SHOWN':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                ...entry.fullContents,
                                isShown: true
                            }
                        };
                    })
                }))
            };

        case 'FULL_CONTENTS_HIDDEN':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                ...entry.fullContents,
                                isShown: false
                            }
                        };
                    })
                }))
            };

        case 'BOOKMARK_COUNTS_FETCHED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        const bookmarkCount = event.bookmarkCounts[entry.url];
                        if (bookmarkCount == null) {
                            return entry;
                        }
                        return {
                            ...entry,
                            bookmarkCount
                        };
                    })
                }))
            };

        case 'ENTRY_COMMENTS_FETCHING':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                ...entry.comments,
                                isLoaded: false,
                                isLoading: true
                            }
                        };
                    })
                }))
            };

        case 'ENTRY_COMMENTS_FETCHING_FAILED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                ...entry.comments,
                                isLoading: false
                            }
                        };
                    })
                }))
            };

        case 'ENTRY_COMMENTS_FETCHED':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                isLoaded: true,
                                isLoading: false,
                                isShown: true,
                                items: event.comments
                            }
                        };
                    })
                }))
            };

        case 'ENTRY_COMMENTS_SHOWN':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                ...entry.comments,
                                isShown: true
                            }
                        };
                    })
                }))
            };

        case 'ENTRY_COMMENTS_HIDDEN':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                ...entry.comments,
                                isShown: false
                            }
                        };
                    })
                }))
            };

        case 'UNREAD_KEEPING_CHANGED':
            return {
                ...streams,
                keepUnread: event.keepUnread
            };

        case 'ALL_ENTRIES_MARKING_AS_READ':
        case 'ENTRIES_MARKING_AS_READ':
        case 'CATEGORY_MARKING_AS_READ':
        case 'FEED_MARKING_AS_READ':
            return {
                ...streams,
                isMarking: true
            };

        case 'ALL_ENTRIES_MARKING_AS_READ':
        case 'ENTRIES_MARKING_AS_READ_FAILED':
        case 'CATEGORY_MARKING_AS_READ_FAILED':
        case 'FEED_MARKING_AS_READ_FAILED':
            return {
                ...streams,
                isMarking: false
            };

        case 'ALL_ENTRIES_MARKED_AS_READ':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        return {
                            ...entry,
                            markedAsRead: true
                        };
                    })
                })),
                isMarking: false
            };

        case 'ENTRIES_MARKED_AS_READ':
            return {
                ...streams,
                items: CacheMap.mapValues(streams.items, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => {
                        if (!event.entryIds.includes(entry.entryId)) {
                            return entry;
                        }
                        return {
                            ...entry,
                            markedAsRead: true
                        };
                    })
                })),
                isMarking: false
            };

        case 'FEED_MARKED_AS_READ':
            return {
                ...streams,
                items: CacheMap.update(streams.items, event.streamId, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => ({
                        ...entry,
                        markedAsRead: true
                    }))
                })),
                isMarking: false
            };

        case 'CATEGORY_MARKED_AS_READ':
            return {
                ...streams,
                items: CacheMap.update(streams.items, event.streamId, (stream) => ({
                    ...stream,
                    entries: stream.entries.map((entry) => ({
                        ...entry,
                        markedAsRead: true
                    }))
                })),
                isMarking: false
            };

        case 'DEFAULT_STREAM_OPTIONS_CHANGED':
            return {
                ...streams,
                defaultFetchOptions: event.fetchOptions
            };

        case 'STREAM_CACHE_CAPACITY_CHANGED':
            return {
                ...streams,
                items: CacheMap.extend(streams.items, event.capacity)
            };

        default:
            return streams;
    }
}
