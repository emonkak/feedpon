import { State, SyncEvent } from 'messaging/types';

import credentialReducer from 'messaging/credential/reducer';
import feedReducer from 'messaging/feed/reducer';
import notificationsReducer from 'messaging/notification/reducer';
import subscriptionsReducer from 'messaging/subscription/reducer';
import siteinfoReducer from 'messaging/siteinfo/reducer';

export default function reducer(state: State, event: SyncEvent): State {
    return {
        credential: credentialReducer(state.credential, event),
        environment: state.environment,
        feed: feedReducer(state.feed, event),
        notifications: notificationsReducer(state.notifications, event),
        preference: state.preference,
        subscriptions: subscriptionsReducer(state.subscriptions, event),
        siteinfo: siteinfoReducer(state.siteinfo, event)
    };
}
