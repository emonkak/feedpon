/* global chrome */

import ActionDispatcher from './shared/dispatchers/ActionDispatcher';
import ExpandUrlHandler from './handlers/ExpandUrlHandler';
import FetchCategoriesHandler from './handlers/FetchCategoriesHandler';
import FetchContentsHandler from './handlers/FetchContentsHandler';
import FetchFullContentHandler from './handlers/FetchFullContentHandler';
import FetchSubscriptionsHandler from './handlers/FetchSubscriptionsHandler';
import FetchUnreadCountsHandler from './handlers/FetchUnreadCountsHandler';
import GetCategoriesCacheHandler from './handlers/GetCategoriesCacheHandler';
import GetCredentialHandler from './handlers/GetCredentialHandler';
import GetSubscriptionsCacheHandler from './handlers/GetSubscriptionsCacheHandler';
import GetUnreadCountsCacheHandler from './handlers/GetUnreadCountsCacheHandler';
import container from './container';
import { fromEventPattern } from 'rxjs/observable/fromEventPattern';
import { filter } from 'rxjs/operator/filter';
import { takeUntil } from 'rxjs/operator/takeUntil';

const actionDispatcher = new ActionDispatcher(container)
    .mount(ExpandUrlHandler)
    .mount(FetchCategoriesHandler)
    .mount(FetchContentsHandler)
    .mount(FetchFullContentHandler)
    .mount(FetchSubscriptionsHandler)
    .mount(FetchUnreadCountsHandler)
    .mount(GetCategoriesCacheHandler)
    .mount(GetCredentialHandler)
    .mount(GetSubscriptionsCacheHandler)
    .mount(GetUnreadCountsCacheHandler);

const port$ = fromEventPattern(
    ::chrome.runtime.onConnect.addListener,
    ::chrome.runtime.onConnect.removeListener
);

const message$ = fromEventPattern(
    handler => chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        handler({ request, sender, sendResponse });
        return true;
    }),
    handler => chrome.runtime.onMessage.removeListener(handler),
);

port$.subscribe(port => {
    const disconnected = fromEventPattern(
        ::port.onDisconnect.addListener,
        ::port.onDisconnect.removeListener
    );

    message$
        ::takeUntil(disconnected)
        ::filter(message => message.sender.tab.id === port.sender.tab.id)
        .subscribe(message => {
            actionDispatcher.dispatch(message.request)
                .subscribe(
                    event => port.postMessage(event),
                    error => {
                        message.sendResponse({ error: error ? error.toString() : null });
                        throw error;
                    },
                    () => message.sendResponse({})
                );
        });
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' });
});
