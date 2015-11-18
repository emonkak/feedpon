/// <reference path="../../typings/linq.d.ts" />
/// <reference path="../../typings/whatwg-fetch.d.ts" />

import * as Enumerable from 'linq'
import { IHttpClient } from '../http/interfaces'
import { IWedataLoader, IWedataRepository, WedataItem } from './interfaces'
import { Inject } from '../../di/annotations'

interface AutoPagerizeData {
    url: string
    nextLink: string
    pageElement: string
    exampleUrl?: string
    insertBefore?: string
}

interface LDRFullFeedData {
    url: string
    xpath: string
    type: string
    enc?: string
    microformats?: string
    base?: string
}

const AUTO_PAGERIZE_RESOURCE_URL = 'http://wedata.net/databases/AutoPagerize'
const LDR_FULL_FEED_RESOURCE_URL = 'http://wedata.net/databases/LDRFullFeed'

@Inject
export default class FullContentLoader {
    private siteinfo: { [key: string]: linq.IEnumerable<any> } = {}

    constructor(private httpClient: IHttpClient,
                private wedataLoader: IWedataLoader,
                private wedataRepository: IWedataRepository) {
    }

    load(request: Request): Promise<HTMLElement> {
        return this.httpClient.send(request)
            .then(response => response.text())
            .then(responseText => parseHtml(responseText))
            .then(html => {
                return this.findElementByLDRFullFeed(request.url, html.body)
                    .then(el => el as any || this.findElementByAutoPagerize(request.url, html.body))
            })
    }

    reload(): Promise<void> {
        return Promise.all<any>([
            this.loadSiteinfo(LDR_FULL_FEED_RESOURCE_URL),
            this.loadSiteinfo(AUTO_PAGERIZE_RESOURCE_URL)
        ]).then(([ldrFullFeedItems, autoPagerizeItems]) => {
            this.siteinfo[LDR_FULL_FEED_RESOURCE_URL] = transformLDRFullFeedData(ldrFullFeedItems)
            this.siteinfo[AUTO_PAGERIZE_RESOURCE_URL] = transformAutoPagerizeData(autoPagerizeItems)
        })
    }

    private findElementByLDRFullFeed(url: string, html: HTMLElement): Promise<HTMLElement> {
        return this.getSiteinfo<LDRFullFeedData>(LDR_FULL_FEED_RESOURCE_URL, transformLDRFullFeedData)
            .then(entries => entries
                .where(entry => matches(new RegExp(entry.url), url))
                .selectMany(entry => {
                    const xpathResult = document.evaluate(
                        entry.xpath,
                        html,
                        null,
                        XPathResult.ANY_TYPE,
                        null
                    )

                    return xPathResultToEnumerable(xpathResult)
                })
                .firstOrDefault(null, null)
            )
    }

    private findElementByAutoPagerize(url: string, html: HTMLElement): Promise<HTMLElement> {
        return this.getSiteinfo<AutoPagerizeData>(AUTO_PAGERIZE_RESOURCE_URL, transformAutoPagerizeData)
            .then(entries => entries
                .where(entry => matches(new RegExp(entry.url), url))
                .selectMany(entry => {
                    const xpathResult = document.evaluate(
                        entry.pageElement,
                        html,
                        null,
                        XPathResult.ANY_TYPE,
                        null
                    )

                    return xPathResultToEnumerable(xpathResult)
                })
                .firstOrDefault(null, null)
            )
    }

    private getSiteinfo<T>(resourceUrl: string, transformer: (items: WedataItem<T>[]) => linq.IEnumerable<T>): Promise<linq.IEnumerable<T>> {
        if (this.siteinfo[resourceUrl]) {
            return Promise.resolve(this.siteinfo[resourceUrl])
        }

        return this.wedataRepository.getAll(resourceUrl)
            .then(items => items as any || this.loadSiteinfo<T>(resourceUrl))
            .then(items => this.siteinfo[resourceUrl] = transformer(items))
    }

    private loadSiteinfo<T>(resourceUrl: string): Promise<WedataItem<T>[]> {
        return this.wedataLoader.loadItems<T>(resourceUrl)
            .then(items => this.wedataRepository.putAll(resourceUrl, items).then(() => items))
    }
}

function matches(pattern: RegExp, text: string): boolean {
    try {
        return pattern.test(text)
    } catch (error) {
        return false
    }
}

function xPathResultToEnumerable(xpathResult: XPathResult): linq.IEnumerable<HTMLElement> {
    return Enumerable.Utils.createEnumerable(() => {
        return Enumerable.Utils.createEnumerator<HTMLElement>(
            function() {},
            function() {
                var node = xpathResult.iterateNext()
                if (node == null) return this.yieldBreak()
                return this.yieldReturn(node)
            },
            function() {}
        )
    })
}

function parseHtml(htmlText: string): HTMLDocument {
    const parser = new DOMParser()

    let html = parser.parseFromString(htmlText, 'text/html')

    if (html == null) {
        html = document.implementation.createHTMLDocument('')
        html.body.innerHTML = htmlText
    }

    return html
}

function transformAutoPagerizeData(items: WedataItem<AutoPagerizeData>[]): linq.IEnumerable<AutoPagerizeData> {
    return Enumerable.from(items).select(item => item.data)
}

function transformLDRFullFeedData(items: WedataItem<LDRFullFeedData>[]): linq.IEnumerable<LDRFullFeedData> {
    return Enumerable.from(items)
        .select(item => item.data)
        .groupBy(entry => {
            switch (entry.type) {
            case 'SBM':
                return 0;
            case 'IND':
            case 'INDIVIDUAL':
                return 1;
            case 'SUB':
            case 'SUBGENERAL':
                return 2;
            case 'GEN':
            case 'GENERAL':
                return 3;
            }
        })
        .orderBy(entries => entries.key())
        .selectMany(entries => entries)
}
