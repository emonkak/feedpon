import {
    Credential,
    Feed,
    Notification,
    Preference,
    State,
    Subscriptions,
    SyncEvent
} from './types';

export default function reducer(state: State, event: SyncEvent): State {
    return {
        credential: reduceCredential(state.credential, event),
        environment: state.environment,
        feed: reduceFeed(state.feed, event),
        notifications: reduceNotifications(state.notifications, event),
        preference: reducePreference(state.preference, event),
        subscriptions: reduceSubscriptions(state.subscriptions, event)
    };
}

function reduceCredential(credential: Credential | null, event: SyncEvent): Credential | null {
    switch (event.type) {
        case 'AUTHENTICATED':
            return event.credential;

        default:
            return credential;
    }
}

function reduceFeed(feed: Feed | null, event: SyncEvent): Feed {
    switch (event.type) {
        case 'FEED_FETCHING':
            if (feed && feed.feedId === event.feedId) {
                return {
                    ...feed,
                    hasMoreEntries: false,
                    isLoading: true
                };
            }

            return {
                feedId: event.feedId,
                title: 'Loading...',
                description: '',
                entries: [],
                subscribers: 0,
                hasMoreEntries: false,
                isLoading: true
            };

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

        case 'READ_ENTRIES_CLEARED':
            if (feed) {
                return {
                    ...feed,
                    entries: feed.entries.map(entry => {
                        if (entry.markAsRead) {
                            return entry;
                        }

                        return {
                            ...entry,
                            readAt: null
                        };
                    })
                };
            }

            return null;

        case 'ENTRY_READ':
            if (feed) {
                return {
                    ...feed,
                    entries: feed.entries.map(entry => {
                        if (event.entryIds.indexOf(entry.entryId) === -1) {
                            return entry;
                        }

                        return {
                            ...entry,
                            readAt: event.readAt
                        };
                    })
                };
            }

            return null;

        case 'ENTRY_MARKED_AS_READ':
            if (feed) {
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
            }

            return null;

        default:
            return feed;
    }
}

function reduceNotifications(notifications: Notification[], event: SyncEvent): Notification[] {
    switch (event.type) {
        case 'NOTIFICATION_SENT':
            return [...notifications, event.notification];

        case 'NOTIFICATION_DISMISSED':
            return notifications.filter(notification => notification.id !== event.id)

        default:
            return notifications;
    }
}

function reducePreference(preference: Preference, event: SyncEvent): Preference {
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

function reduceSubscriptions(subscriptions: Subscriptions, event: SyncEvent): Subscriptions {
    switch (event.type) {
        case 'SUBSCRIPTIONS_FETCHING':
            return {
                ...subscriptions,
                isLoading: true
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                categories: event.categories,
                isLoading: false,
                items: event.subscriptions,
                lastUpdatedAt: event.fetchedAt
            };

        default:
            return subscriptions;
    }
}
