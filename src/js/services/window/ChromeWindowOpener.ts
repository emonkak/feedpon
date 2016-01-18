/// <reference path="../../typings/chrome.d.ts" />

import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern'
import { IWindowOpener } from './interfaces'
import { Inject } from '../../shared/di/annotations'
import { Observable } from 'rxjs/Observable'
import { Subscriber } from 'rxjs/Subscriber'
import { Subscription } from 'rxjs/Subscription'

import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'

@Inject
export default class ChromeWindowOpener implements IWindowOpener {
    private _updatedTabs: Observable<{ tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab }> = FromEventPatternObservable.create(
        (handler) => chrome.tabs.onUpdated.addListener(handler as any),
        (handler) => chrome.tabs.onUpdated.removeListener(handler as any),
        (tabId, changeInfo, tab) => ({ tabId, changeInfo, tab })
    )

    private _removedWindows: Observable<number> = FromEventPatternObservable.create(
        (handler) => chrome.windows.onRemoved.addListener(handler as any),
        (handler) => chrome.windows.onRemoved.removeListener(handler as any)
    )

    open(url: string): Observable<string> {
        return Observable.create((subscriber: Subscriber<string>) => {
            chrome.windows.create({ url, type: 'popup' }, window => {
                const createdwindowId = window.id
                const createdTabId = window.tabs[0].id

                const subscription = this._removedWindows
                    .filter(windowId => windowId === createdwindowId)
                    .subscribe(() => subscriber.complete())
                subscriber.add(subscription)

                this._updatedTabs
                    .filter(({ tabId, changeInfo }) => tabId === createdTabId && changeInfo.status === 'complete')
                    .map(({ tab }) => tab.url)
                    .subscribe(subscriber)

                subscriber.add(new Subscription(() => {
                    chrome.windows.remove(createdwindowId)
                }))
            })
        })
    }
}
