import type { Search, Event } from '../index';

export default function reducer(search: Search, event: Event) {
  switch (event.type) {
    case 'APPLICATION_INITIALIZED':
      return {
        ...search,
        isLoading: false,
        feeds: search.feeds.map((feed) => {
          if (!feed.isLoading) {
            return feed;
          }
          return {
            ...feed,
            isLoading: false,
          };
        }),
      };

    case 'FEED_SEARCHING':
      return {
        ...search,
        feeds: [],
        isLoaded: false,
        isLoading: true,
        query: event.query,
      };

    case 'FEED_SEARCHING_FAILED':
      return {
        ...search,
        isLoaded: true,
        isLoading: false,
      };

    case 'FEED_SEARCHED':
      if (search.query !== event.query) {
        return search;
      }

      return {
        ...search,
        feeds: event.feeds,
        isLoaded: true,
        isLoading: false,
        query: event.query,
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
            isLoading: true,
          };
        }),
      };

    case 'FEED_SUBSCRIBING_FAILED':
      return {
        ...search,
        feeds: search.feeds.map((feed) => {
          if (feed.feedId !== event.feedId) {
            return feed;
          }
          return {
            ...feed,
            isLoading: false,
          };
        }),
      };

    case 'FEED_SUBSCRIBED':
      return {
        ...search,
        feeds: search.feeds.map((feed) => {
          if (feed.feedId !== event.subscription.feedId) {
            return feed;
          }
          return {
            ...feed,
            isLoading: false,
          };
        }),
      };

    case 'FEED_UNSUBSCRIBING':
      return {
        ...search,
        feeds: search.feeds.map((feed) => {
          if (feed.feedId !== event.feedId) {
            return feed;
          }
          return {
            ...feed,
            isLoading: true,
          };
        }),
      };

    case 'FEED_UNSUBSCRIBING_FAILED':
      return {
        ...search,
        feeds: search.feeds.map((feed) => {
          if (feed.feedId !== event.feedId) {
            return feed;
          }
          return {
            ...feed,
            isLoading: false,
          };
        }),
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
            isLoading: false,
          };
        }),
      };

    default:
      return search;
  }
}
