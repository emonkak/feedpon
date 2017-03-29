import querystring from 'querystring';

import * as feedly from './types';

function createAuthHeader(accessToken: string): { [key: string]: string } {
    return {
        'Authorization': 'OAuth ' + accessToken
    };
}

function doGet<T>(endpoint: string, path: string, params?: { [key: string]: any }, headers?: { [key: string]: string }): Promise<T> {
    const url = endpoint + path + (params ? '?' + querystring.stringify(params) : '');
    const request = new Request(url, {
        method: 'GET',
        headers
    });
    return fetch(request)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<T>(response => response.json());
}

function doPost<T>(endpoint: string, path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
    const url = endpoint + path;
    const request = new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: data ? JSON.stringify(data) : null
    });
    return fetch(request)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<T>(response => response.json());
}

function doDelete<T>(endpoint: string, path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
    const url = endpoint + path;
    const request = new Request(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: data ? JSON.stringify(data) : null
    });
    return fetch(request)
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<T>(response => response.json());
}

export function exchangeToken(endpoint: string, input: feedly.ExchangeTokenInput): Promise<feedly.ExchangeTokenResponse> {
    return doPost(endpoint, 'v3/auth/token', input);
}

export function refreshToken(endpoint: string, input: feedly.RefreshTokenInput): Promise<feedly.RefreshTokenResponse> {
    return doPost(endpoint, 'v3/auth/token', input);
}

export function revokeToken(endpoint: string, input: feedly.RevokeTokenInput): Promise<feedly.RevokeTokenResponse> {
    return doPost(endpoint, 'v3/auth/token', input);
}

export function allCategories(endpoint: string, accessToken: string): Promise<feedly.Category[]> {
    return doGet(endpoint, 'v3/categories', null, createAuthHeader(accessToken));
}

export function deleteCategory(endpoint: string, accessToken: string, categoryId: string): Promise<string> {
    return doDelete(endpoint, 'v3/categories/' + categoryId, null, createAuthHeader(accessToken));
}

export function getFeed(endpoint: string, accessToken: string, feedId: string): Promise<feedly.Feed> {
    return doGet(endpoint, 'v3/feeds/' + feedId, null, createAuthHeader(accessToken));
}

export function allUnreadCounts(endpoint: string, accessToken: string, input: feedly.GetUnreadCountsInput = {}): Promise<feedly.GetUnreadCountsResponce> {
    return doGet(endpoint, 'v3/markers/counts', input, createAuthHeader(accessToken));
}

export function markAsReadForEntries(endpoint: string, accessToken: string, entryIds: string | string[]): Promise<void> {
    return doPost<void>(endpoint, 'v3/markers', {
        action: 'markAsRead',
        type: 'entries',
        entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
    }, createAuthHeader(accessToken));
}

export function markAsReadForFeeds(endpoint: string, accessToken: string, feedIds: string | string[]): Promise<void> {
    return doPost<void>(endpoint, 'v3/markers', {
        action: 'markAsRead',
        type: 'feeds',
        feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
    }, createAuthHeader(accessToken));
}

export function markAsReadForCetegories(endpoint: string, accessToken: string, categoryIds: string | string[]): Promise<void> {
    return doPost<void>(endpoint, 'v3/markers', {
        action: 'markAsRead',
        type: 'categories',
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
    }, createAuthHeader(accessToken));
}

export function keepUnreadForEntries(endpoint: string, accessToken: string, entryIds: string | string[]): Promise<void> {
    return doPost<void>(endpoint, 'v3/markers', {
        action: 'keepUnread',
        type: 'entries',
        entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
    }, createAuthHeader(accessToken));
}

export function keepUnreadForFeeds(endpoint: string, accessToken: string, feedIds: string | string[]): Promise<void> {
    return doPost<void>(endpoint, 'v3/markers', {
        action: 'keepUnread',
        type: 'feeds',
        feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
    }, createAuthHeader(accessToken));
}

export function keepUnreadForCetegories(endpoint: string, accessToken: string, categoryIds: string | string[]): Promise<void> {
    return doPost<void>(endpoint, 'v3/markers', {
        action: 'keepUnread',
        type: 'categories',
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
    }, createAuthHeader(accessToken));
}

export function getStreamIds(endpoint: string, accessToken: string, input: feedly.GetStreamInput): Promise<feedly.GetEntryIdsResponse> {
    return doGet(endpoint, 'v3/streams/ids', input, createAuthHeader(accessToken));
}

export function getStreamContents(endpoint: string, accessToken: string, input: feedly.GetStreamInput): Promise<feedly.Contents> {
    return doGet(endpoint, 'v3/streams/contents', input, createAuthHeader(accessToken));
}

export function allSubscriptions(endpoint: string, accessToken: string): Promise<feedly.Subscription[]> {
    return doGet(endpoint, 'v3/subscriptions', null, createAuthHeader(accessToken));
}
