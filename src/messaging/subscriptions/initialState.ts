import { Subscriptions } from 'messaging/types';

const subscriptions: Subscriptions = {
    isImporting: false,
    isLoading: false,
    items: {},
    lastUpdatedAt: 0,
    onlyUnread: true,
    order: 'title',
    version: 1
};

export default subscriptions;
