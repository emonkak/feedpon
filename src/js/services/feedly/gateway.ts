/// <reference path="../../typings/whatwg-fetch.d.ts" />

import * as feedly from './interfaces'
import { IHttpClient } from '../http/interfaces'
import { Inject } from '../../di/annotations'

function authHeader(accessToken: string): { [key: string]: string } {
    return {
        'Authorization': 'OAuth ' + accessToken
    }
}

@Inject
export default class Gateway {
    constructor(private environment: feedly.IEnvironment,
                private httpClient: IHttpClient) {
    }

    exchangeToken(input: feedly.ExchangeTokenInput): Promise<feedly.ExchangeTokenResponse> {
        return this.doPost('v3/auth/token', input)
    }

    refreshToken(input: feedly.RefreshTokenInput): Promise<feedly.RefreshTokenResponse> {
        return this.doPost('v3/auth/token', input)
    }

    revokeToken(input: feedly.RevokeTokenInput): Promise<feedly.RevokeTokenResponse> {
        return this.doPost('v3/auth/token', input)
    }

    allCategories(accessToken: string): Promise<feedly.Category[]> {
        return this.doGet('v3/categories', null, authHeader(accessToken))
    }

    deleteCategory(accessToken: string, categoryId: string): Promise<string> {
        return this.doDelete('v3/categories/' + categoryId, null, authHeader(accessToken))
    }

    getFeed(accessToken: string, feedId: string): Promise<feedly.Feed> {
        return this.doGet('v3/feeds/' + feedId, null, authHeader(accessToken))
    }

    allUnreadCounts(accessToken: string, input: feedly.UnreadCountsInput = {}): Promise<feedly.UnreadCountsResponce> {
        return this.doGet('v3/markers/counts', input, authHeader(accessToken))
    }

    markAsReadForEntries(accessToken: string, entryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'markAsRead',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        }, authHeader(accessToken))
    }

    markAsReadForFeeds(accessToken: string, feedIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'markAsRead',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        }, authHeader(accessToken))
    }

    markAsReadForCetegories(accessToken: string, categoryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'markAsRead',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        }, authHeader(accessToken))
    }

    keepUnreadForEntries(accessToken: string, entryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'keepUnread',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        }, authHeader(accessToken))
    }

    keepUnreadForFeeds(accessToken: string, feedIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'keepUnread',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        }, authHeader(accessToken))
    }

    keepUnreadForCetegories(accessToken: string, categoryIds: string | string[]): Promise<void> {
        return this.doPost<void>('v3/markers', {
            action: 'keepUnread',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        }, authHeader(accessToken))
    }

    getEntryIds(accessToken: string, input: feedly.GetStreamInput): Promise<feedly.GetEntryIdsResponse> {
        return this.doGet('v3/streams/ids', input, authHeader(accessToken))
    }

    getContents(accessToken: string, input: feedly.GetStreamInput): Promise<feedly.Contents> {
        return this.doGet('v3/streams/contents', input, authHeader(accessToken))
    }

    allSubscriptions(accessToken: string): Promise<feedly.Subscription[]> {
        return this.doGet('v3/subscriptions', null, authHeader(accessToken))
    }

    private doGet<T>(path: string, data?: { [key: string]: any }, headers?: { [key: string]: string }): Promise<T> {
        const url = this.environment.endpoint + path
        const body = data ? Object.keys(data).reduce((acc, key) => {
            acc.append(key, data[key])
            return acc
        }, new FormData()) : null
        const request = new Request(url, {
            method: 'GET',
            headers,
            body
        })
        return this.httpClient.send(request).then(response => response.json<T>())
    }

    private doPost<T>(path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
        const url = this.environment.endpoint + path
        const request = new Request(url, {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
            body: data ? JSON.stringify(data) : null
        })
        return this.httpClient.send(request).then(response => response.json<T>())
    }

    private doDelete<T>(path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
        const url = this.environment.endpoint + path
        const request = new Request(url, {
            method: 'DELETE',
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
            body: data ? JSON.stringify(data) : null
        })
        return this.httpClient.send(request).then(response => response.json<T>())
    }
}
