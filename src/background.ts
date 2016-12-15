import * as backgroundActions from './messaging/backgroundActions';
import { Action, BackgroundAction } from './messaging/types';

chrome.runtime.onConnect.addListener(port => {
    port.onMessage.addListener(message => {
        handle(message as BackgroundAction, (action: Action) => port.postMessage(action));
    });
})

function handle(action: BackgroundAction, dispatch: (action: Action) => void): void {
    switch (action.type) {
        case backgroundActions.EXPAND_URL:
            break;

        case backgroundActions.FETCH_CONTENTS:
            break;

        case backgroundActions.FETCH_CATEGORIES:
            break;

        case backgroundActions.FETCH_FULL_CONTENT:
            break;

        case backgroundActions.FETCH_SUBSCRIPTIONS:
            break;

        case backgroundActions.FETCH_UNREAD_COUNTS:
            break;

        case backgroundActions.GET_CATEGORIES_CACHE:
            break;

        case backgroundActions.GET_CREDENTIAL:
            break;

        case backgroundActions.GET_SUBSCRIPTIONS_CACHE:
            break;

        case backgroundActions.GET_UNREAD_COUNTS_CACHE:
            break;
    }
}
