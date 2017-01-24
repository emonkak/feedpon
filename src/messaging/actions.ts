import { AsyncAction } from 'messaging/types';

export const FETCH_SUBSCRIPTIONS = 'FETCH_SUBSCRIPTIONS';

export function fetchSubscriptions(): AsyncAction {
    const subscriptions = [
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

    return dispatch => {
        setTimeout(() => {
            dispatch({
                type: FETCH_SUBSCRIPTIONS,
                subscriptions,
            });
        }, 500);
    };
}
