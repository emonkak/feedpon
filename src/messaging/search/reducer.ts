import { Search, SyncEvent } from 'messaging/types';

export default function reducer(search: Search, event: SyncEvent) {
    switch (event.type) {
        case 'FEED_SEARCHING':
            return {
                feeds: [],
                isLoading: true,
                isLoaded: false,
                query: event.query
            };

        case 'FEED_SEARCHED':
            if (search.query !== event.query) {
                return search;
            }

            return {
                feeds: event.feeds,
                isLoading: false,
                isLoaded: true,
                query: event.query
            };

        case 'FEED_SUBSCRIBING':
            return {
                ...search,
                feeds: search.feeds.map((feed) => {
                    if (feed.feedId !== event.feedId) {
                        return feed;
                    }
                    return {
                        ...feed,
                        isSubscribing: true
                    };
                })
            };

        case 'FEED_SUBSCRIBED':
            return {
                ...search,
                feeds: search.feeds.map((feed) => {
                    if (feed.feedId !== event.feedId) {
                        return feed;
                    }
                    return {
                        ...feed,
                        isSubscribing: false
                    };
                })
            };

        case 'FEED_UNSUBSCRIBED':
            return {
                ...search,
                feeds: search.feeds.map((feed) => {
                    if (feed.feedId !== event.feedId) {
                        return feed;
                    }
                    return {
                        ...feed,
                        isSubscribing: false
                    };
                })
            };

        default:
            return search;
    }
}
