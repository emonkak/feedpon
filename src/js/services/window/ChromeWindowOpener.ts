import { FromEventPatternObservable } from 'rxjs/observable/fromEventPattern'
import { IWindowOpener } from './interfaces'
import { Inject } from '../../shared/di/annotations'
import { Observable } from 'rxjs/Observable'
import { Subscriber } from 'rxjs/Subscriber'
import { Subscription } from 'rxjs/Subscription'

import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/finally'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/takeUntil'

@Inject
export default class ChromeWindowOpener implements IWindowOpener {
    private _tabUpdated: Observable<{ tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab }> = FromEventPatternObservable.create(
        (handler) => chrome.tabs.onUpdated.addListener(handler as any),
        (handler) => chrome.tabs.onUpdated.removeListener(handler as any),
        (tabId, changeInfo, tab) => ({ tabId, changeInfo, tab })
    )

    private _windowRemoved: Observable<number> = FromEventPatternObservable.create(
        (handler) => chrome.windows.onRemoved.addListener(handler as any),
        (handler) => chrome.windows.onRemoved.removeListener(handler as any)
    )

    open(url: string): Observable<string> {
        return Observable.create((subscriber: Subscriber<string>) => {
            chrome.windows.create({ url, type: 'popup' }, window => {
                const createdwindowId = window.id
                const createdTabId = window.tabs[0].id

                const windowRemoved = this._windowRemoved
                    .filter(windowId => windowId === createdwindowId)

                this._tabUpdated
                    .takeUntil(windowRemoved)
                    .finally(() => chrome.windows.remove(createdwindowId))
                    .filter(({ tabId, changeInfo }) => tabId === createdTabId && changeInfo.status === 'complete')
                    .map(({ tab }) => tab.url)
                    .subscribe(subscriber)
            })
        })
    }
}
