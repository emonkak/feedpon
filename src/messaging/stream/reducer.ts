import initialState from 'messaging/initialState';
import { Stream, SyncEvent } from 'messaging/types';

export default function reducer(stream: Stream, event: SyncEvent): Stream {
    switch (event.type) {
        case 'BOOKMARK_COUNTS_FETCHED':
            return {
                ...stream,
                entries: stream.entries.map(entry => ({
                    ...entry,
                    bookmarkCount: event.bookmarkCounts[entry.url] || 0
                }))
            };

        case 'COMMENTS_FETCHED':
            return {
                ...stream,
                entries: stream.entries.map(entry => {
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


        case 'STREAM_FETCHING':
            if (stream.streamId !== event.streamId) {
                return {
                    ...initialState.stream,
                    streamId: event.streamId,
                    isLoading: true,
                    isLoaded: false
                };
            }

            return {
                ...stream,
                isLoading: true,
                isLoaded: false
            };

        case 'STREAM_FETCHED':
            return event.stream;

        case 'FULL_CONTENT_FETCHING':
            return {
                ...stream,
                entries: stream.entries.map(entry => {
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
                ...stream,
                entries: stream.entries.map(entry => {
                    if (entry.entryId !== event.entryId) {
                        return entry;
                    }

                    return {
                        ...entry,
                        fullContents: {
                            isLoaded: true,
                            isLoading: false,
                            items: event.fullContent ? entry.fullContents.items.concat([event.fullContent]) : entry.fullContents.items
                        }
                    };
                })
            };

        case 'STREAM_VIEW_CHANGED':
            return {
                ...stream,
                options: {
                    ...stream.options,
                    view: event.view
                }
            };

        case 'MORE_ENTRIES_FETCHING':
            if (stream.streamId !== event.streamId) {
                return stream;
            }

            return {
                ...stream,
                isLoading: true
            };

        case 'MORE_ENTRIES_FETCHED':
            if (stream.streamId !== event.streamId) {
                return stream;
            }

            return {
                ...stream,
                continuation: event.continuation,
                entries: stream.entries.concat(event.entries),
                isLoading: false
            };

        case 'ENTRY_MARKED_AS_READ':
            return {
                ...stream,
                entries: stream.entries.map(entry => {
                    if (event.entryIds.indexOf(entry.entryId) === -1) {
                        return entry;
                    }

                    return {
                        ...entry,
                        markedAsRead: true
                    };
                })
            };

        case 'ENTRY_PINNING':
            return {
                ...stream,
                entries: stream.entries.map(entry => {
                    if (entry.entryId !== event.entryId) {
                        return entry;
                    }

                    return {
                        ...entry,
                        isPinning: true
                    };
                })
            };

        case 'ENTRY_PINNED':
            return {
                ...stream,
                entries: stream.entries.map(entry => {
                    if (entry.entryId !== event.entryId) {
                        return entry;
                    }

                    return {
                        ...entry,
                        isPinning: false,
                        isPinned: event.isPinned
                    };
                })
            };

        default:
            return stream;
    }
}
