import { Streams, Event } from 'messaging/types';

export default function reducer(streams: Streams, event: Event): Streams {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
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
                    })
                },
                isLoading: false,
                isMarking: false
            };

        case 'STREAM_FETCHING':
            return {
                ...streams,
                current: {
                    streamId: event.streamId,
                    title: 'Loading...',
                    entries: [],
                    continuation: null,
                    feed: null,
                    category: null,
                    options: streams.current.options
                },
                isLoaded: false,
                isLoading: true
            };

        case 'STREAM_FETCHING_FAILED':
            return {
                ...streams,
                isLoaded: true,
                isLoading: false
            };

        case 'STREAM_FETCHED':
            return {
                ...streams,
                current: event.stream,
                isLoaded: true,
                isLoading: false
            };

        case 'MORE_ENTRIES_FETCHING':
            if (streams.current.streamId !== event.streamId) {
                return streams;
            }

            return {
                ...streams,
                isLoading: true
            };

        case 'MORE_ENTRIES_FETCHING_FAILED':
            if (streams.current.streamId !== event.streamId) {
                return streams;
            }

            return {
                ...streams,
                isLoading: false
            };

        case 'MORE_ENTRIES_FETCHED':
            if (streams.current.streamId !== event.streamId) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    continuation: event.continuation,
                    entries: streams.current.entries.concat(event.entries)
                },
                isLoading: false,
            };

        case 'ENTRY_PINNING':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: true
                        };
                    })
                }
            };

        case 'ENTRY_PINNING_FAILED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: false
                        };
                    })
                }
            };

        case 'ENTRY_PINNED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            isPinning: false,
                            isPinned: event.isPinned
                        };
                    })
                }
            };

        case 'ENTRY_URLS_EXPANDED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (!event.urls[entry.url]) {
                            return entry;
                        }
                        return {
                            ...entry,
                            url: event.urls[entry.url]
                        };
                    })
                }
            };

        case 'FEED_SUBSCRIBING':
            if (!streams.current.feed || streams.current.feed.feedId !== event.feedId) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isLoading: true,
                    }
                }
            };

        case 'FEED_SUBSCRIBING_FAILED':
            if (!(streams.current.feed && streams.current.feed.feedId === event.feedId)) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isLoading: false,
                    }
                }
            };

        case 'FEED_SUBSCRIBED':
            if (!(streams.current.feed && streams.current.feed.feedId === event.subscription.feedId)) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isLoading: false,
                    }
                }
            };

        case 'FEED_UNSUBSCRIBING':
            if (!streams.current.feed || streams.current.feed.feedId !== event.subscription.feedId) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isLoading: true,
                    }
                }
            };

        case 'FEED_UNSUBSCRIBING_FAILED':
            if (!(streams.current.feed && streams.current.feed.feedId === event.subscription.feedId)) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isLoading: false,
                    }
                }
            };

        case 'FEED_UNSUBSCRIBED':
            if (!(streams.current.feed && streams.current.feed.feedId === event.subscription.feedId)) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isLoading: false,
                    }
                }
            };

        case 'FULL_CONTENT_FETCHING':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
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
                }
            };

        case 'FULL_CONTENT_FETCHING_FAILED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                ...entry.fullContents,
                                isLoaded: true,
                                isLoading: false
                            }
                        };
                    })
                }
            };

        case 'FULL_CONTENT_FETCHED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            fullContents: {
                                isLoaded: true,
                                isLoading: false,
                                items: entry.fullContents.items.concat([event.fullContent])
                            }
                        };
                    })
                }
            };

        case 'BOOKMARK_COUNTS_FETCHED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => ({
                        ...entry,
                        bookmarkCount: event.bookmarkCounts[entry.url] || 0
                    }))
                }
            };

        case 'COMMENTS_FETCHING':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                isLoaded: false,
                                isLoading: true,
                                items: []
                            }
                        };
                    })
                }
            };

        case 'COMMENTS_FETCHING_FAILED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                isLoaded: true,
                                isLoading: false,
                                items: []
                            }
                        };
                    })
                }
            };

        case 'COMMENTS_FETCHED':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (entry.entryId !== event.entryId) {
                            return entry;
                        }
                        return {
                            ...entry,
                            comments: {
                                isLoaded: true,
                                isLoading: false,
                                items: event.comments
                            }
                        };
                    })
                }
            };

        case 'UNREAD_KEEPING_CHANGED':
            return {
                ...streams,
                keepUnread: event.keepUnread
            };

        case 'ENTRIES_MARKING_AS_READ':
        case 'CATEGORY_MARKING_AS_READ':
        case 'FEED_MARKING_AS_READ':
            return {
                ...streams,
                isMarking: true
            };

        case 'ENTRIES_MARKING_AS_READ_FAILED':
        case 'CATEGORY_MARKING_AS_READ_FAILED':
        case 'FEED_MARKING_AS_READ_FAILED':
            return {
                ...streams,
                isMarking: false
            };

        case 'ENTRIES_MARKED_AS_READ':
            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        if (!event.entryIds.includes(entry.entryId)) {
                            return entry;
                        }
                        return {
                            ...entry,
                            markedAsRead: true
                        };
                    })
                },
                isMarking: false
            };

        case 'FEED_MARKED_AS_READ':
            if (streams.current.feed && streams.current.feed.feedId !== event.feedId) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        return {
                            ...entry,
                            markedAsRead: true
                        };
                    })
                },
                isMarking: false
            };

        case 'CATEGORY_MARKED_AS_READ':
            if (streams.current.category && streams.current.category.categoryId !== event.categoryId) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    entries: streams.current.entries.map((entry) => {
                        return {
                            ...entry,
                            markedAsRead: true
                        };
                    })
                },
                isMarking: false
            };

        default:
            return streams;
    }
}
