import { Action, AsyncAction, Entry, Feed, Notification, Subscription } from 'messaging/types';

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

const entries: Entry[] = [
    {
        entryId: 1,
        author: 'Lorem Ipsum',
        content: `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
        postedAt: new Date().toISOString(),
        title: 'Lorem Ipsum',
        url: 'http://www.lipsum.com/',
    },
    {
        entryId: 2,
        author: 'Lorem Ipsum',
        content: `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
        postedAt: new Date().toISOString(),
        title: 'Lorem Ipsum',
        url: 'http://www.lipsum.com/',
    },
    {
        entryId: 3,
        author: 'Lorem Ipsum',
        content: `<p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>`,
        postedAt: new Date().toISOString(),
        title: 'Lorem Ipsum',
        url: 'http://www.lipsum.com/',
    },
];

const delay = 500;

export function fetchSubscriptions(): AsyncAction {
    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: 'FETCH_SUBSCRIPTIONS',
                subscriptions,
            });
        }, delay);
    };
}

export function fetchAllEntries(): AsyncAction {
    return dispatch => {
        const feed: Feed = {
            title: 'All',
            type: 'all',
        };

        dispatch({
            type: 'SELECT_FEED',
            feed,
        });

        setTimeout(() => {
            dispatch({
                type: 'FETCH_ENTRIES',
                entries,
                feed,
            });
        }, delay);
    };
}

export function fetchCategoryEntries(categoryId: number): AsyncAction {
    return dispatch => {
        const feed: Feed = {
            id: categoryId,
            title: 'Category Title',
            type: 'category',
        };

        dispatch({
            type: 'SELECT_FEED',
            feed,
        });

        setTimeout(() => {
            dispatch({
                type: 'FETCH_ENTRIES',
                entries,
                feed,
            });
        }, delay);
    };
}

export function fetchPinEntries(): AsyncAction {
    return dispatch => {
        const feed: Feed = {
            title: 'Pins',
            type: 'pin',
        };

        dispatch({
            type: 'SELECT_FEED',
            feed,
        });

        setTimeout(() => {
            dispatch({
                type: 'FETCH_ENTRIES',
                entries,
                feed,
            });
        }, delay);
    };
}

export function fetchSubscriptionEntries(subscriptionId: number): AsyncAction {
    return dispatch => {
        const feed: Feed = {
            type: 'subscription',
            title: 'Subscription Title',
            id: subscriptionId,
        };

        dispatch({
            type: 'SELECT_FEED',
            feed,
        });

        setTimeout(() => {
            dispatch({
                type: 'FETCH_ENTRIES',
                entries,
                feed,
            });
        }, delay);
    };
}

export function unselectFeed(): Action {
    return {
        type: 'UNSELECT_FEED',
    };
}

export function sendNotification(notification: Notification): AsyncAction {
    if (!notification.id) {
        notification.id = Date.now();
    }

    return dispatch => {
        dispatch({
            type: 'SEND_NOTIFICATION',
            notification
        });

        if (notification.dismissAfter) {
            setTimeout(() => {
                dispatch(dismissNotification(notification.id));
            }, notification.dismissAfter);
        }
    };
}

export function dismissNotification(id: number): Action {
    return {
        type: 'DISMISS_NOTIFICATION',
        id,
    };
}
