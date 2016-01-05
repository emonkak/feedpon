/// <reference path="../../typings/chrome.d.ts" />

import { IWindowOpener } from './interfaces'
import { Inject } from '../../shared/di/annotations'

@Inject
export default class ChromeWindowOpener implements IWindowOpener {
    open(url: string, urlChanged: (url: string, close: () => void) => void): void {
        chrome.windows.create({
            url,
            type: 'popup'
        }, window => {
            const firstTabId = window.tabs[0].id

            chrome.tabs.onUpdated.addListener((tabId, { status }, tab) => {
                if (tabId === firstTabId && status === 'complete') {
                    urlChanged(tab.url, () => chrome.tabs.remove(tabId))
                }
            })
        })
    }
}
