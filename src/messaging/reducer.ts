import update from 'immutability-helper';

import * as actions from './actions';
import { Action, State } from './types';

export default function reducer(state: State, action: Action): State {
    switch (action.type) {
        case actions.ACTIVATE_ENTRY: {
            return Object.assign({}, state, {
                activeEntry: action.entry
            });
        }

        case actions.EXPAND_URL: {
            const { contents } = state;
            if (contents == null) {
                return state;
            }

            const items = contents.items.map(item => {
                const expanded = item.alternate.some(link => link.href === action.url);
                if (!expanded) {
                    return item;
                }

                const alternate = item.alternate.map(link => {
                    return link.href === action.url
                        ? { type: link.type, href: action.redirectUrl }
                        : link;
                });

                return Object.assign({}, item, { alternate });
            });

            return update(state, {
                contents: { items: { $set: items } }
            });
        }

        case actions.RECEIVE_CATEGORIES: {
            return Object.assign({}, state, {
                categories: action.categories
            });
        }

        case actions.RECEIVE_CONTENTS: {
            if (state.contents && state.contents.id === action.contents.id) {
                return update(state, {
                    contents: {
                        items: { $push: action.contents.items }
                    }
                });
            } else {
                return Object.assign({}, state, {
                    contents: action.contents
                });
            }
        }

        case actions.RECEIVE_CREDENTIAL: {
            return Object.assign({}, state, {
                state: 'AUTHENTICATED',
                credential: action.credential
            });
        }

        case actions.RECEIVE_FULL_CONTENT: {
            const { contents } = state;
            if (contents == null) {
                return state;
            }

            const items = contents.items.map(item => {
                if (item.id === action.fullContent.streamId) {
                    item.fullContents = item.fullContents || [];
                    return update(item, {
                        fullContents: { $push: [action.fullContent] }
                    });
                } else {
                    return item;
                }
            });

            return update(state, {
                contents: { items: { $set: items } }
            });
        }

        case actions.RECEIVE_SUBSCRIPTIONS: {
            return Object.assign({}, state, {
                unreadCounts: action.subscriptions
            });
        }

        case actions.RECEIVE_UNREAD_COUNTS: {
            return Object.assign({}, state, {
                unreadCounts: action.unreadCounts
            });
        }

        case actions.REVOKE_CREDENTIAL: {
            return Object.assign({}, state, {
                state: 'AUTHENTICATION_REQUIRED'
            });
        }
    }

    return state;
}
