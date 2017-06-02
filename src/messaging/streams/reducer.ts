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
                isLoading: false
            }

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

        case 'STREAM_FETCHING':
            return {
                current: {
                    streamId: event.streamId,
                    title: 'Loading...',
                    entries: [],
                    continuation: null,
                    feed: null,
                    subscription: null,
                    options: streams.current.options
                },
                isLoaded: false,
                isLoading: true,
                version: streams.version
            };

        case 'STREAM_FETCHING_FAILED':
            return {
                current: streams.current,
                isLoaded: true,
                isLoading: false,
                version: streams.version
            };

        case 'STREAM_FETCHED':
            return {
                current: event.stream,
                isLoaded: true,
                isLoading: false,
                version: streams.version
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

        case 'STREAM_VIEW_CHANGED':
            if (streams.current.streamId !== event.streamId) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    options: {
                        ...streams.current.options,
                        view: event.view
                    }
                }
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

        case 'ENTRY_MARKED_AS_READ':
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
                }
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

        case 'SUBSCRIPTIONS_FETCHED': {
            if (!streams.current.subscription) {
                return streams;
            }

            const subscription = event.subscriptions
                .find((subscription) => subscription.streamId === streams.current.streamId);

            if (!subscription) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    subscription
                }
            };
        }

        case 'FEED_SUBSCRIBING':
            if (!(streams.current.feed && streams.current.feed.feedId === event.feedId)) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isSubscribing: true
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
                        isSubscribing: false
                    }
                }
            };

        case 'FEED_SUBSCRIBED':
            if (!(streams.current.feed && streams.current.feed.feedId === event.feedId)) {
                return streams;
            }

            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isSubscribing: false
                    },
                    subscription: event.subscription
                }
            };

        case 'FEED_UNSUBSCRIBED':
            if (!(streams.current.feed && streams.current.feed.feedId === event.feedId)) {
                return streams;
            }
            return {
                ...streams,
                current: {
                    ...streams.current,
                    feed: {
                        ...streams.current.feed,
                        isSubscribing: false
                    },
                    subscription: null
                }
            };

        default:
            return streams;
    }
}
