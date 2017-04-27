import {
    Credential,
    Feed,
    Notification,
    Preference,
    State,
    Siteinfo,
    Subscriptions,
    SyncEvent
} from './types';

import initialState from './initialState';

export default function reducer(state: State, event: SyncEvent): State {
    return {
        credential: reduceCredential(state.credential, event),
        environment: state.environment,
        feed: reduceFeed(state.feed, event),
        notifications: reduceNotifications(state.notifications, event),
        preference: reducePreference(state.preference, event),
        subscriptions: reduceSubscriptions(state.subscriptions, event),
        siteinfo: reduceSiteinfo(state.siteinfo, event)
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

function reduceFeed(feed: Feed, event: SyncEvent): Feed {
    switch (event.type) {
        case 'BOOKMARK_COUNTS_FETCHED':
            return {
                ...feed,
                entries: feed.entries.map(entry => ({
                    ...entry,
                    bookmarkCount: event.bookmarkCounts[entry.url] || 0
                }))
            };

        case 'COMMENTS_FETCHED':
            return {
                ...feed,
                entries: feed.entries.map(entry => {
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


        case 'FEED_FETCHING':
            if (feed.feedId !== event.feedId) {
                return {
                    ...initialState.feed,
                    feedId: event.feedId,
                    isLoading: true,
                    isLoaded: false
                };
            }

            return {
                ...feed,
                isLoading: true,
                isLoaded: false
            };

        case 'FEED_FETCHED':
            return event.feed;

        case 'FULL_CONTENT_FETCHING':
            return {
                ...feed,
                entries: feed.entries.map(entry => {
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
                ...feed,
                entries: feed.entries.map(entry => {
                    if (entry.entryId !== event.entryId) {
                        return entry;
                    }

                    return {
                        ...entry,
                        fullContents: {
                            isLoaded: true,
                            isLoading: false,
                            items: event.fullContent ? entry.fullContents.items.concat([event.fullContent]) : entry.fullContents.items,
                            nextPageUrl: event.nextPageUrl
                        }
                    };
                })
            };

        case 'FEED_VIEW_CHANGED':
            return {
                ...feed,
                view: event.view
            };

        case 'MORE_ENTRIES_FETCHING':
            if (feed.feedId !== event.feedId) {
                return feed;
            }

            return {
                ...feed,
                isLoading: true
            };

        case 'MORE_ENTRIES_FETCHED':
            if (feed.feedId !== event.feedId) {
                return feed;
            }

            return {
                ...feed,
                continuation: event.continuation,
                entries: feed.entries.concat(event.entries),
                isLoading: false
            };

        case 'READ_ENTRIES_CLEARED':
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

        case 'ENTRY_READ':
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

        case 'ENTRY_MARKED_AS_READ':
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

function reduceSiteinfo(siteinfo: Siteinfo, event: SyncEvent): Siteinfo {
    switch (event.type) {
        case 'SITEINFO_UPDATED':
            return event.siteinfo;

        default:
            return siteinfo;
    }
}
