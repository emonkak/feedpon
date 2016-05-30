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
import { ExpandUrl, FetchCategories, FetchContents, FetchFullContent, FetchSubscriptions, FetchUnreadCounts, GetCategoriesCache, GetCredential, GetSubscriptionsCache, GetUnreadCountsCache } from './constants/actionTypes';
import { fromEventPattern } from 'rxjs/observable/fromEventPattern';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { filter } from 'rxjs/operator/filter';
import { map } from 'rxjs/operator/map';
import { takeUntil } from 'rxjs/operator/takeUntil';

const actionDispatcher = new ActionDispatcher(container)
    .mount(ExpandUrl, ExpandUrlHandler)
    .mount(FetchCategories, FetchCategoriesHandler)
    .mount(FetchContents, FetchContentsHandler)
    .mount(FetchFullContent, FetchFullContentHandler)
    .mount(FetchSubscriptions, FetchSubscriptionsHandler)
    .mount(FetchUnreadCounts, FetchUnreadCountsHandler)
    .mount(GetCategoriesCache, GetCategoriesCacheHandler)
    .mount(GetCredential, GetCredentialHandler)
    .mount(GetSubscriptionsCache, GetSubscriptionsCacheHandler)
    .mount(GetUnreadCountsCache, GetUnreadCountsCacheHandler);

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
                    error => message.sendResponse({error: error ? error.toString() : null }),
                    () => message.sendResponse({})
                );
        });
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'index.html' });
});
