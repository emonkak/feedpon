import { Event, State } from 'messaging/types';

export default function reducer(state: State, event: Event): State {
    switch (event.type) {
        case 'FEED_FETCHING':
            if (state.feed && state.feed.feedId === event.feedId) {
                return {
                    ...state,
                    feed: {
                        ...state.feed,
                        hasMoreEntries: false,
                        isLoading: true
                    }
                };
            }

            return {
                ...state,
                feed: null
            };

        case 'FEED_FETCHED':
            if (state.feed && state.feed.feedId !== event.feed.feedId) {
                return state;
            }

            const entries = state.feed
                ? state.feed.entries.concat(event.feed.entries)
                : event.feed.entries;

            return {
                ...state,
                feed: {
                    ...event.feed,
                    entries
                }
            };

        case 'CATEGORIES_FETCHED':
            return {
                ...state,
                categories: event.categories
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                ...state,
                subscriptions: event.subscriptions
            };

        case 'FEED_UNSELECTED':
            return {
                ...state,
                feed: null
            };

        case 'NOTIFICATION_SENT':
            return {
                ...state,
                notifications: [...state.notifications, event.notification]
            };

        case 'NOTIFICATION_DISMISSED':
            return {
                ...state,
                notifications: state.notifications.filter(notification => notification.id !== event.id)
            };

        case 'VIEW_TYPE_CHANGED':
            return {
                ...state,
                viewMode: event.viewMode
            };

        default:
            return state;
    }
}
