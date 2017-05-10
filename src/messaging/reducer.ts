import { State, SyncEvent } from 'messaging/types';

import credentialReducer from 'messaging/credential/reducer';
import notificationsReducer from 'messaging/notification/reducer';
import searchReducer from 'messaging/search/reducer';
import siteinfoReducer from 'messaging/siteinfo/reducer';
import streamReducer from 'messaging/stream/reducer';
import subscriptionsReducer from 'messaging/subscription/reducer';

export default function reducer(state: State, event: SyncEvent): State {
    return {
        credential: credentialReducer(state.credential, event),
        environment: state.environment,
        notifications: notificationsReducer(state.notifications, event),
        search: searchReducer(state.search, event),
        settings: state.settings,
        siteinfo: siteinfoReducer(state.siteinfo, event),
        stream: streamReducer(state.stream, event),
        subscriptions: subscriptionsReducer(state.subscriptions, event)
    };
}
