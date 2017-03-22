import { Category, Event, Feed, Notification, Preference, State, Subscription } from 'messaging/types';

export default function reducer(state: State, event: Event): State {
    return {
        categories: reduceCategories(state.categories, event),
        feed: reduceFeed(state.feed, event),
        notifications: reduceNotifications(state.notifications, event),
        preference: reducePreference(state.preference, event),
        subscriptions: reduceSubscriptions(state.subscriptions, event)
    };
}

function reduceCategories(categories: Category[], event: Event): Category[] {
    switch (event.type) {
        case 'CATEGORIES_FETCHED':
            return event.categories;

        default:
            return categories;
    }
}

function reduceFeed(feed: Feed | null, event: Event): Feed {
    switch (event.type) {
        case 'FEED_FETCHING':
            if (feed && feed.feedId === event.feedId) {
                return {
                    ...feed,
                    hasMoreEntries: false,
                    isLoading: true
                };
            }

            return null;

        case 'FEED_FETCHED':
            if (feed) {
                if (feed.feedId !== event.feed.feedId) {
                    return feed;
                }

                return {
                    ...event.feed,
                    entries: feed.entries.concat(event.feed.entries)
                };
            }

            return event.feed;

        case 'FEED_UNSELECTED':
            return null;

        case 'READ_ENTRIES_CLEARED':
            if (feed) {
                return {
                    ...feed,
                    entries: feed.entries.map(entry => ({
                        ...entry,
                        readAt: null,
                        keepUnread: false
                    }))
                };
            }

            return null;

        case 'ENTRY_MARKED_AS_READ':
            if (feed) {
                return {
                    ...feed,
                    entries: feed.entries.map(entry => {
                        if (entry.entryId === event.entryId) {
                            return {
                                ...entry,
                                readAt: event.readAt,
                                keepUnread: false
                            };
                        } else {
                            return entry;
                        }
                    })
                };
            }

            return null;

        case 'ENTRY_KEPT_AS_UNREAD':
            if (feed) {
                return {
                    ...feed,
                    entries: feed.entries.map(entry => {
                        if (entry.entryId === event.entryId) {
                            return {
                                ...entry,
                                readAt: null,
                                keepUnread: true
                            };
                        } else {
                            return entry;
                        }
                    })
                };
            }

            return null;

        default:
            return feed;
    }
}

function reduceNotifications(notifications: Notification[], event: Event): Notification[] {
    switch (event.type) {
        case 'NOTIFICATION_SENT':
            return [...notifications, event.notification];

        case 'NOTIFICATION_DISMISSED':
            return notifications.filter(notification => notification.id !== event.id)

        default:
            return notifications;
    }
}

function reducePreference(preference: Preference, event: Event): Preference {
    switch (event.type) {
        case 'VIEW_MODE_CHANGED':
            return {
                ...preference,
                viewMode: event.viewMode
            };

        default:
            return preference;
    }
}

function reduceSubscriptions(subscriptions: Subscription[], event: Event): Subscription[] {
    switch (event.type) {
        case 'SUBSCRIPTIONS_FETCHED':
            return event.subscriptions;

        default:
            return subscriptions;
    }
}
