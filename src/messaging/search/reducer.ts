import { Search, Event } from 'messaging/types';

export default function reducer(search: Search, event: Event) {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...search,
                isLoading: false,
                feeds: search.feeds.map((feed) => {
                    if (!feed.isSubscribing) {
                        return feed;
                    }
                    return {
                        ...feed,
                        isSubscribing: false
                    };
                })
            }

        case 'FEED_SEARCHING':
            return {
                feeds: [],
                isLoaded: false,
                isLoading: true,
                query: event.query,
                version: search.version
            };

        case 'FEED_SEARCHING_FAILED':
            return {
                feeds: search.feeds,
                isLoaded: true,
                isLoading: false,
                query: search.query,
                version: search.version
            };

        case 'FEED_SEARCHED':
            if (search.query !== event.query) {
                return search;
            }

            return {
                feeds: event.feeds,
                isLoaded: true,
                isLoading: false,
                query: event.query,
                version: search.version
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
        case 'FEED_SUBSCRIBING_FAILED':
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
