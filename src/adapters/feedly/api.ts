import querystring from 'querystring';

import * as types from './types';

const ENDPOINT = 'https://cloud.feedly.com/';

function createAuthHeader(accessToken: string): { [key: string]: string } {
    return {
        'Authorization': 'OAuth ' + accessToken
    };
}

function doGet<T>(path: string, params?: { [key: string]: any }, headers?: { [key: string]: string }): Promise<T> {
    const url = ENDPOINT + path + (params ? '?' + querystring.stringify(params) : '');

    return fetch(url, {
            method: 'GET',
            headers
        })
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<T>(response => response.json());
}

function doPost<T>(path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
    const url = ENDPOINT + path;

    return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: data ? JSON.stringify(data) : null
        })
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<T>(response => response.json());
}

function doDelete<T>(path: string, data?: { [key: string]: any }, headers?:  { [key: string]: string }): Promise<T> {
    const url = ENDPOINT + path;

    return fetch(url, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: data ? JSON.stringify(data) : null
        })
        .then<Response>(response => response.ok ? response : Promise.reject(response))
        .then<T>(response => response.json());
}

export function createAuthUrl(input: types.AuthenticateInput): string {
    return ENDPOINT + 'v3/auth/auth?' +
        querystring.stringify({
            client_id: input.client_id,
            redirect_uri: input.redirect_uri,
            response_type: input.response_type,
            scope: input.scope
        });
}

export function authCallback(urlString: string): types.AuthenticateResponse {
    const url = new URL(urlString);
    const { searchParams } = url as any;  // XXX: Avoid the type definition bug

    return {
        code: searchParams.get('code'),
        state: searchParams.get('state'),
        error: searchParams.get('error')
    };
}

export function exchangeToken(input: types.ExchangeTokenInput): Promise<types.ExchangeTokenResponse> {
    return doPost('v3/auth/token', input);
}

export function refreshToken(input: types.RefreshTokenInput): Promise<types.RefreshTokenResponse> {
    return doPost('v3/auth/token', input);
}

export function revokeToken(input: types.RevokeTokenInput): Promise<types.RevokeTokenResponse> {
    return doPost('v3/auth/token', input);
}

export function allCategories(accessToken: string): Promise<types.Category[]> {
    return doGet('v3/categories', {}, createAuthHeader(accessToken));
}

export function deleteCategory(accessToken: string, categoryId: string): Promise<string> {
    return doDelete('v3/categories/' + encodeURIComponent(categoryId), {}, createAuthHeader(accessToken));
}

export function getFeed(accessToken: string, feedId: string): Promise<types.Feed> {
    return doGet('v3/feeds/' + encodeURIComponent(feedId), {}, createAuthHeader(accessToken));
}

export function allUnreadCounts(accessToken: string, input: types.GetUnreadCountsInput = {}): Promise<types.GetUnreadCountsResponce> {
    return doGet('v3/markers/counts', input, createAuthHeader(accessToken));
}

export function markAsReadForEntries(accessToken: string, entryIds: string | string[]): Promise<void> {
    return doPost<void>('v3/markers', {
        action: 'markAsRead',
        type: 'entries',
        entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
    }, createAuthHeader(accessToken));
}

export function markAsReadForFeeds(accessToken: string, feedIds: string | string[]): Promise<void> {
    return doPost<void>('v3/markers', {
        action: 'markAsRead',
        type: 'feeds',
        feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
    }, createAuthHeader(accessToken));
}

export function markAsReadForCetegories(accessToken: string, categoryIds: string | string[]): Promise<void> {
    return doPost<void>('v3/markers', {
        action: 'markAsRead',
        type: 'categories',
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
    }, createAuthHeader(accessToken));
}

export function keepUnreadForEntries(accessToken: string, entryIds: string | string[]): Promise<void> {
    return doPost<void>('v3/markers', {
        action: 'keepUnread',
        type: 'entries',
        entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
    }, createAuthHeader(accessToken));
}

export function keepUnreadForFeeds(accessToken: string, feedIds: string | string[]): Promise<void> {
    return doPost<void>('v3/markers', {
        action: 'keepUnread',
        type: 'feeds',
        feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
    }, createAuthHeader(accessToken));
}

export function keepUnreadForCetegories(accessToken: string, categoryIds: string | string[]): Promise<void> {
    return doPost<void>('v3/markers', {
        action: 'keepUnread',
        type: 'categories',
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
    }, createAuthHeader(accessToken));
}

export function getStreamIds(accessToken: string, input: types.GetStreamInput): Promise<types.GetEntryIdsResponse> {
    return doGet('v3/streams/ids', input, createAuthHeader(accessToken));
}

export function getStreamContents(accessToken: string, input: types.GetStreamInput): Promise<types.Contents> {
    return doGet('v3/streams/contents', input, createAuthHeader(accessToken));
}

export function allSubscriptions(accessToken: string): Promise<types.Subscription[]> {
    return doGet('v3/subscriptions', {}, createAuthHeader(accessToken));
}
