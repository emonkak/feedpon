import * as actions from './actions';
import * as backgroundActions from './backgroundActions';
import * as feedly from '../services/feedly/types';

export type Action
    = { type: typeof actions.ACTIVATE_ENTRY, entry: feedly.Entry }
    | { type: typeof actions.AUTHENTICATE }
    | { type: typeof actions.EXPAND_URL, url: string, redirectUrl: string }
    | { type: typeof actions.RECEIVE_CATEGORIES, categories: feedly.Category[] }
    | { type: typeof actions.RECEIVE_CONTENTS, contents: feedly.Contents }
    | { type: typeof actions.RECEIVE_CREDENTIAL, credential: feedly.Credential }
    | { type: typeof actions.RECEIVE_FULL_CONTENT, fullContent: FullContent }
    | { type: typeof actions.RECEIVE_SUBSCRIPTIONS, subscriptions: feedly.Subscription[] }
    | { type: typeof actions.RECEIVE_UNREAD_COUNTS, unreadCounts: feedly.UnreadCount[] }
    | { type: typeof actions.REVOKE_CREDENTIAL }
    | { type: typeof actions.RUN_IN_BACKGROUND, payload: BackgroundAction }
    | { type: typeof actions.HISTORY.PUSH, path: string }
    | { type: typeof actions.HISTORY.REPLACE, path: string }
    | { type: typeof actions.HISTORY.GO, n: number }
    | { type: typeof actions.HISTORY.GO_BACK }
    | { type: typeof actions.HISTORY.GO_FORWARD };

export type BackgroundAction
    = { type: typeof backgroundActions.EXPAND_URL, url: string }
    | { type: typeof backgroundActions.FETCH_CONTENTS, payload: feedly.GetStreamInput }
    | { type: typeof backgroundActions.FETCH_CATEGORIES  }
    | { type: typeof backgroundActions.FETCH_FULL_CONTENT, streamId: string, url: string }
    | { type: typeof backgroundActions.FETCH_SUBSCRIPTIONS }
    | { type: typeof backgroundActions.FETCH_UNREAD_COUNTS, payload: feedly.GetUnreadCountsInput }
    | { type: typeof backgroundActions.GET_CATEGORIES_CACHE }
    | { type: typeof backgroundActions.GET_CREDENTIAL }
    | { type: typeof backgroundActions.GET_SUBSCRIPTIONS_CACHE }
    | { type: typeof backgroundActions.GET_UNREAD_COUNTS_CACHE };

export interface State {
    state: 'BOOTING' | 'AUTHENTICATION_REQUIRED' | 'AUTHENTICATED';
    subscriptions: feedly.Subscription[];
    categories: feedly.Category[];
    unreadCounts: feedly.UnreadCount[];
    contents?: Contents;
    credential?: feedly.Credential;
    feedly: feedly.Environment;
}

export interface Contents extends feedly.Contents {
    items: Entry[];
}

export interface Entry extends feedly.Entry {
    fullContents?: FullContent[];
}

export interface FullContent {
    streamId: string;
    url: string;
    content: string;
    nextLink?: string;
}
