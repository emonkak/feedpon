import filterObject from 'feedpon-utils/filterObject';
import mapObject from 'feedpon-utils/mapObject';

import type { Event, Subscription, Subscriptions } from '../index';

export default function reducer(subscriptions: Subscriptions, event: Event): Subscriptions {
    switch (event.type) {
        case 'APPLICATION_INITIALIZED':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (!subscription.isLoading) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        isLoading: false
                    };
                }),
                isLoading: false,
                isImporting: false
            };

        case 'SUBSCRIPTIONS_FETCHING':
            return {
                ...subscriptions,
                isLoading: true
            };

        case 'SUBSCRIPTIONS_FETCHING_FAILED':
            return {
                ...subscriptions,
                isLoading: false
            };

        case 'SUBSCRIPTIONS_FETCHED':
            return {
                ...subscriptions,
                isLoading: false,
                items: event.subscriptions.reduce<{ [key: string]: Subscription }>((acc, subscription) => {
                    acc[subscription.subscriptionId] = subscription;
                    return acc;
                }, {}),
                lastUpdatedAt: event.fetchedAt
            };

        case 'SUBSCRIPTIONS_ORDER_CHANGED':
            return {
                ...subscriptions,
                order: event.order
            };

        case 'SUBSCRIPTIONS_UNREAD_VIEWING_CHANGED':
            return {
                ...subscriptions,
                onlyUnread: event.onlyUnread
            };

        case 'SUBSCRIPTIONS_IMPORTING':
            return {
                ...subscriptions,
                isImporting: true
            };

        case 'SUBSCRIPTIONS_IMPORTING_DONE':
            return {
                ...subscriptions,
                isImporting: false
            };

        case 'FEED_SUBSCRIBING':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (subscription.feedId !== event.feedId) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        isLoading: true
                    };
                })
            };

        case 'FEED_SUBSCRIBING_FAILED':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (subscription.feedId !== event.feedId) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        isLoading: false
                    };
                })
            };

        case 'FEED_SUBSCRIBED':
            return {
                ...subscriptions,
                items: {
                    ...subscriptions.items,
                    [event.subscription.subscriptionId]: event.subscription
                }
            };

        case 'FEED_UNSUBSCRIBING':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (subscription.feedId !== event.feedId) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        isLoading: true
                    };
                })
            };

        case 'FEED_UNSUBSCRIBING_FAILED':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (subscription.feedId !== event.feedId) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        isLoading: false
                    };
                })
            };

        case 'FEED_UNSUBSCRIBED':
            return {
                ...subscriptions,
                items: filterObject(
                    subscriptions.items,
                    (subscription) => subscription.feedId !== event.feedId
                )
            };

        case 'CATEGORY_DELETED':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    const labels = subscription.labels
                        .filter((label) => label !== event.label);

                    if (subscription.labels.length === labels.length) {
                        return subscription;
                    }

                    return {
                        ...subscription,
                        labels
                    };
                })
            };

        case 'CATEGORY_UPDATED':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    const labels = subscription.labels
                        .filter((label) => label !== event.prevCategory.label);

                    if (subscription.labels.length === labels.length) {
                        return subscription;
                    }

                    return {
                        ...subscription,
                        labels: [...labels, event.category.label]
                    };
                })
            };

        case 'ALL_ENTRIES_MARKED_AS_READ':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    return {
                        ...subscription,
                        readCount: subscription.unreadCount
                    };
                })
            };

        case 'ENTRIES_MARKED_AS_READ':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (!event.readCounts[subscription.streamId]) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        readCount: subscription.readCount + event.readCounts[subscription.streamId]!,
                    };
                })
            };

        case 'FEED_MARKED_AS_READ':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (subscription.feedId !== event.feedId) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        readCount: subscription.unreadCount
                    };
                })
            };

        case 'CATEGORY_MARKED_AS_READ':
            return {
                ...subscriptions,
                items: mapObject(subscriptions.items, (subscription) => {
                    if (!subscription.labels.includes(event.label)) {
                        return subscription;
                    }
                    return {
                        ...subscription,
                        readCount: subscription.unreadCount
                    };
                })
            };

        default:
            return subscriptions;
    }
}
