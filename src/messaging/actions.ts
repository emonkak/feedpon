import { AsyncAction, Entry, Event, Feed, Notification, Subscription, ViewType } from 'messaging/types';
import rss from 'json/rss.json';

const subscriptions: Subscription[] = [
    {
        subscriptionId: 1,
        title: 'Entry',
        category: {
            categoryId: 1,
            name: 'Bike',
        },
        unreadCount: 123,
    },
    {
        subscriptionId: 2,
        title: 'Really Very Long Title Entry',
        category: {
            categoryId: 1,
            name: 'Bike',
        },
        unreadCount: 0,
    },
    {
        subscriptionId: 3,
        title: 'Entry',
        category: {
            categoryId: 1,
            name: 'Bike',
        },
        unreadCount: 1234,
    },
    {
        subscriptionId: 4,
        title: 'Entry',
        category: {
            categoryId: 2,
            name: 'Programing',
        },
        unreadCount: 123,
    }
];

const entries: Entry[] = rss.items.map((item: any) => ({
    entryId: item.guid,
    author: item.author,
    content: item.content,
    description: item.description,
    publishedAt: item.pubDate,
    popularity: Math.random() * 100,
    title: item.title,
    url: item.link,
    origin: {
        title: rss.feed.title,
        url: rss.feed.link,
    }
}));

// const entries: Entry[] = [
//     {
//         entryId: 1,
//         author: 'Lorem Ipsum',
//         content: `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
//         publishedAt: new Date().toISOString(),
//         title: 'Lorem Ipsum',
//         url: 'http://www.lipsum.com/',
//     },
//     {
//         entryId: 2,
//         author: 'Lorem Ipsum',
//         content: `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
//         publishedAt: new Date().toISOString(),
//         title: 'Lorem Ipsum',
//         url: 'http://www.lipsum.com/',
//     },
//     {
//         entryId: 3,
//         author: 'Lorem Ipsum',
//         content: `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
//         publishedAt: new Date().toISOString(),
//         title: 'Lorem Ipsum',
//         url: 'http://www.lipsum.com/',
//     },
// ];

const delay = 500;

export function fetchSubscriptions(): AsyncAction {
    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: 'SUBSCRIPTIONS_FETCHED',
                subscriptions
            });
        }, delay);
    };
}

export function fetchAllEntries(): AsyncAction {
    return dispatch => {
        setTimeout(() => {
            const feed: Feed = {
                title: 'All',
                type: 'all'
            };

            dispatch({
                type: 'FEED_SELECTED',
                feed
            });

            dispatch({
                type: 'ENTRIES_FETCHED',
                entries,
                feed
            });
        }, delay);
    };
}

export function fetchCategory(categoryId: number): AsyncAction {
    return dispatch => {
        setTimeout(() => {
            const feed: Feed = {
                id: categoryId,
                title: 'Category ' + categoryId,
                type: 'category'
            };

            dispatch({
                type: 'FEED_SELECTED',
                feed
            });

            dispatch({
                type: 'ENTRIES_FETCHED',
                entries,
                feed
            });
        }, delay);
    };
}

export function fetchPinEntries(): AsyncAction {
    return dispatch => {
        setTimeout(() => {
            const feed: Feed = {
                title: 'Pins',
                type: 'pin'
            };

            dispatch({
                type: 'FEED_SELECTED',
                feed
            });

            dispatch({
                type: 'ENTRIES_FETCHED',
                entries,
                feed
            });
        }, delay);
    };
}

export function fetchSubscription(subscriptionId: number): AsyncAction {
    return dispatch => {
        setTimeout(() => {
            const feed: Feed = {
                type: 'subscription',
                title: 'Subscription ' + subscriptionId,
                id: subscriptionId
            };

            dispatch({
                type: 'FEED_SELECTED',
                feed
            });

            dispatch({
                type: 'ENTRIES_FETCHED',
                entries,
                feed
            });
        }, delay);
    };
}

export function unselectFeed(): Event {
    return {
        type: 'FEED_UNSELECTED'
    };
}

export function sendNotification(notification: Notification): AsyncAction {
    if (!notification.id) {
        notification.id = Date.now();
    }

    return dispatch => {
        dispatch({
            type: 'NOTIFICATION_SENT',
            notification
        });

        if (notification.dismissAfter) {
            setTimeout(() => {
                dispatch(dismissNotification(notification.id));
            }, notification.dismissAfter);
        }
    };
}

export function dismissNotification(id: any): Event {
    return {
        type: 'NOTIFICATION_DISMISSED',
        id
    };
}

export function changeViewType(viewType: ViewType): Event {
    return {
        type: 'VIEW_TYPE_CHANGED',
        viewType
    };
}
