import * as feedly from './services/feedly/interfaces';
import * as eventTypes from './constants/eventTypes';

const update = require('react-addons-update');

interface State {
    state: 'BOOTING' | 'AUTHENTICATION_REQUIRED' | 'AUTHENTICATED';
    subscriptions: feedly.Subscription[];
    categories: feedly.Category[];
    unreadCounts: feedly.UnreadCount[];
    contents?: feedly.Contents;
    credential?: feedly.Credential;
    location?: HistoryModule.Location;
}

export const initialState: State = {
    state: 'BOOTING',
    subscriptions: [],
    categories: [],
    unreadCounts: [],
    contents: null,
    credential: null,
    location: null
};

export function reducer(state: State, event: eventTypes.Event): State {
    switch (event.eventType) {
        case eventTypes.CategoriesReceived: {
            return Object.assign({}, state, {
                categories: event.categories
            });
        }

        case eventTypes.ContentsReceived: {
            const oldContents = state.contents;
            if (oldContents && oldContents.id === event.contents.id) {
                return Object.assign({}, state, {
                    contents: update(event.contents, {
                        items: { $set: oldContents.items.concat(event.contents.items) }
                    })
                });
            } else {
                return Object.assign({}, state, {
                    contents: event.contents
                });
            }
        }

        case eventTypes.CredentialReceived: {
            return Object.assign({}, state, {
                state: 'AUTHENTICATED',
                credential: event.credential
            });
        }

        case eventTypes.CredentialRevoked: {
            return Object.assign({}, state, {
                state: 'AUTHENTICATION_REQUIRED'
            });
        }

        case eventTypes.EntryActivated: {
            return Object.assign({}, state, {
                activeEntry: event.entry
            });
        }

        case eventTypes.UrlExpanded: {
            const { contents } = state;
            if (contents == null) return state;

            const thisEvent = event;  // XXX: Avoid type analysis bug.
            const items = contents.items.map(item => {
                let hasChanged = false;

                const alternate = item.alternate.map(link => {
                    if (link.href !== thisEvent.url) {
                        return link;
                    }
                    hasChanged = true;
                    return { type: link.type, href: thisEvent.redirectUrl };
                });

                return hasChanged ? Object.assign({}, item, { alternate }) : item;
            });

            return update(state, {
                contents: { items: { $set: items } }
            });
        }

        case eventTypes.FullContentReceived: {
            const { contents } = state;
            if (contents == null) return state;

            const thisEvent = event;  // XXX: Avoid type analysis bug.
            const items = contents.items.map(item => {
                if (item.id === thisEvent.fullContent.streamId) {
                    (item as any)._fullContents = (item as any)._fullContents || [];
                    return update(item, {
                        _fullContents: { $push: [thisEvent.fullContent] }
                    });
                } else {
                    return item;
                }
            });

            return update(state, {
                contents: { items: { $set: items } }
            });
        }

        case eventTypes.LocationUpdated: {
            return Object.assign({}, state, {
                location: event.location
            });
        }

        case eventTypes.SubscriptionsReceived: {
            return Object.assign({}, state, {
                subscriptions: event.subscriptions
            });
        }

        case eventTypes.UnreadCountsReceived: {
            return Object.assign({}, state, {
                unreadCounts: event.unreadCounts
            });
        }
    }

    return state;
}
