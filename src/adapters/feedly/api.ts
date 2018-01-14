import querystring from 'query-string';

import * as types from './types';
import fetch from 'adapters/http/fetch';

const ENDPOINT = 'https://cloud.feedly.com/';

// Authentication API:
export function createAuthUrl(input: types.AuthenticateInput): string {
    return ENDPOINT + 'v3/auth/auth?' + querystring.stringify({
        client_id: input.client_id,
        redirect_uri: input.redirect_uri,
        response_type: input.response_type,
        scope: input.scope
    });
}

export function authCallback(urlString: string): types.AuthenticateResponse {
    const paramsString = urlString.slice(urlString.indexOf('?') + 1);
    const params = querystring.parse(paramsString);

    return {
        code: params['code'],
        state: params['state'],
        error: params['error']
    };
}

export function exchangeToken(input: types.ExchangeTokenInput): Promise<types.ExchangeTokenResponse> {
    return doPost('v3/auth/token', input)
        .then<types.ExchangeTokenResponse>(decodeAsJson);
}

export function refreshToken(input: types.RefreshTokenInput): Promise<types.RefreshTokenResponse> {
    return doPost('v3/auth/token', input)
        .then<types.RefreshTokenResponse>(decodeAsJson);
}

export function revokeToken(input: types.RevokeTokenInput): Promise<types.RevokeTokenResponse> {
    return doPost('v3/auth/token', input)
        .then<types.RevokeTokenResponse>(decodeAsJson);
}

// Categories API:
export function getCategories(accessToken: string): Promise<types.Category[]> {
    return doGet('v3/categories', null, createAuthHeader(accessToken))
        .then<types.Category[]>(decodeAsJson);
}

export function changeCategoryLabel(accessToken: string, categoryId: string, label: string): Promise<Response> {
    return doPost(
        'v3/categories/' + encodeURIComponent(categoryId),
        { label },
        createAuthHeader(accessToken)
    );
}

export function deleteCategory(accessToken: string, categoryId: string): Promise<Response> {
    return doDelete(
        'v3/categories/' + encodeURIComponent(categoryId),
        null,
        createAuthHeader(accessToken)
    );
}

// Feeds API:
export function getFeed(accessToken: string, feedId: string): Promise<types.Feed> {
    return doGet(
        'v3/feeds/' + encodeURIComponent(feedId),
        null,
        createAuthHeader(accessToken)
    ).then<types.Feed>(decodeAsJson);
}

// Markers API:
export function getUnreadCounts(accessToken: string, input: types.GetUnreadCountsInput = {}): Promise<types.GetUnreadCountsResponce> {
    return doGet(
        'v3/markers/counts',
        input,
        createAuthHeader(accessToken)
    ).then<types.GetUnreadCountsResponce>(decodeAsJson);
}

export function markAsReadForEntries(accessToken: string, entryIds: string | string[]): Promise<Response> {
    return doPost(
        'v3/markers',
        {
            action: 'markAsRead',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        },
        createAuthHeader(accessToken)
    );
}

export function markAsReadForFeeds(accessToken: string, feedIds: string | string[]): Promise<Response> {
    return doPost(
        'v3/markers',
        {
            action: 'markAsRead',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        },
        createAuthHeader(accessToken)
    );
}

export function markAsReadForCategories(accessToken: string, categoryIds: string | string[]): Promise<Response> {
    return doPost(
        'v3/markers',
        {
            action: 'markAsRead',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        },
        createAuthHeader(accessToken)
    );
}

export function keepUnreadForEntries(accessToken: string, entryIds: string | string[]): Promise<Response> {
    return doPost(
        'v3/markers',
        {
            action: 'keepUnread',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        },
        createAuthHeader(accessToken)
    );
}

export function keepUnreadForFeeds(accessToken: string, feedIds: string | string[]): Promise<Response> {
    return doPost(
        'v3/markers',
        {
            action: 'keepUnread',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        },
        createAuthHeader(accessToken)
    );
}

export function keepUnreadForCategories(accessToken: string, categoryIds: string | string[]): Promise<Response> {
    return doPost(
        'v3/markers',
        {
            action: 'keepUnread',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        },
        createAuthHeader(accessToken)
    );
}

// OPML API
export function createExportOpmlUrl(accessToken: string): string {
    return ENDPOINT + 'v3/opml?' + querystring.stringify({
        feedlyToken: accessToken
    });
}

export function importOpml(accessToken: string, xmlString: string): Promise<Response> {
    return doPost(
        'v3/opml',
        xmlString,
        createAuthHeader(accessToken),
        'text/xml'
    );
}

// Profile API:
export function getProfile(accessToken: string): Promise<types.Profile> {
    return doGet(
        'v3/profile',
        null,
        createAuthHeader(accessToken)
    ).then<types.Profile>(decodeAsJson);
}

export function updateProfile(accessToken: string, input: types.UpdateProfileInput): Promise<Response> {
    return doPut(
        'v3/profile',
        null,
        createAuthHeader(accessToken)
    );
}

// Search API:
export function searchFeeds(accessToken: string, input: types.SearchInput): Promise<types.SearchResponse> {
    return doGet(
        'v3/search/feeds',
        input,
        createAuthHeader(accessToken)
    ).then<types.SearchResponse>(decodeAsJson);
}

// Streams API:
export function getStreamIds(accessToken: string, input: types.GetStreamInput): Promise<types.GetEntryIdsResponse> {
    return doGet(
        'v3/streams/ids',
        input,
        createAuthHeader(accessToken)
    ).then<types.GetEntryIdsResponse>(decodeAsJson);
}

export function getStreamContents(accessToken: string, input: types.GetStreamInput): Promise<types.Contents> {
    return doGet(
        'v3/streams/contents',
        input,
        createAuthHeader(accessToken)
    ).then<types.Contents>(decodeAsJson);
}

// Subscriptions API:
export function getSubscriptions(accessToken: string): Promise<types.Subscription[]> {
    return doGet(
        'v3/subscriptions',
        null,
        createAuthHeader(accessToken)
    ).then<types.Subscription[]>(decodeAsJson);
}

export function subscribeFeed(accessToken: string, input: types.SubscribeFeedInput): Promise<Response> {
    return doPost(
        'v3/subscriptions',
        input,
        createAuthHeader(accessToken)
    );
}

export function unsubscribeFeed(accessToken: string, feedId: string): Promise<Response> {
    return doDelete(
        'v3/subscriptions/' + encodeURIComponent(feedId),
        null,
        createAuthHeader(accessToken)
    );
}

// Tags API:
export function getTags(accessToken: string): Promise<types.Tag[]> {
    return doGet(
        'v3/tags',
        null,
        createAuthHeader(accessToken)
    ).then<types.Tag[]>(decodeAsJson);
}

export function changeTagLabel(accessToken: string, tagId: string, label: string): Promise<Response> {
    return doPost(
        'v3/tags/' + encodeURIComponent(tagId),
        { label },
        createAuthHeader(accessToken)
    );
}

export function setTag(accessToken: string, entryIds: string[], tagIds: string[]): Promise<Response> {
    return doPut(
        'v3/tags/' + encodeURIComponent(tagIds.join(',')),
        { entryIds },
        createAuthHeader(accessToken)
    );
}

export function unsetTag(accessToken: string, entryIds: string[], tagIds: string[]): Promise<Response> {
    return doDelete(
        'v3/tags/' + encodeURIComponent(tagIds.join(',')) + '/' + encodeURIComponent(entryIds.join(',')),
        null,
        createAuthHeader(accessToken)
    );
}

export function deleteTag(accessToken: string, tagIds: string[]): Promise<Response> {
    return doDelete(
        'v3/tags/' + encodeURIComponent(tagIds.join(',')),
        null,
        createAuthHeader(accessToken)
    );
}

// Utils:
function doGet(path: string, data?: object | null, headers?: { [key: string]: string }): Promise<Response> {
    const url = ENDPOINT + path + (data ? '?' + querystring.stringify(data) : '');

    const params = {
        method: 'GET',
        headers: new Headers(headers)
    };

    return fetch(url, params).then(handleError);
}

function doPost(path: string, data?: string | object | null, headers?: { [key: string]: string }, contentType: string = 'application/json'): Promise<Response> {
    const url = ENDPOINT + path;

    const params = {
        method: 'POST',
        headers: new Headers({ 'Content-Type': contentType, ...headers }),
        body: serializeData(data)
    };

    return fetch(url, params).then(handleError);
}

function doPut(path: string, data?: string | object | null, headers?: { [key: string]: string }, contentType: string = 'application/json'): Promise<Response> {
    const url = ENDPOINT + path;

    const params = {
        method: 'PUT',
        headers: new Headers({ 'Content-Type': contentType, ...headers }),
        body: serializeData(data)
    };

    return fetch(url, params).then(handleError);
}

function doDelete(path: string, data?: string | object | null, headers?: { [key: string]: string }, contentType: string = 'application/json'): Promise<Response> {
    const url = ENDPOINT + path;

    const params = {
        method: 'DELETE',
        headers: new Headers({ 'Content-Type': contentType, ...headers }),
        body: serializeData(data)
    };

    return fetch(url, params).then(handleError);
}

function createAuthHeader(accessToken: string): { [key: string]: string } {
    return {
        'Authorization': 'OAuth ' + accessToken
    };
}

function serializeData(data: string | object | null | undefined): string | null {
    if (data == null) {
        return null;
    }
    return typeof data === 'object' ? JSON.stringify(data) : data;
}

function handleError(response: Response): Promise<Response> {
    if (!response.ok) {
        return response.json()
            .then(
                (error) => Promise.reject(new Error(`${error.errorMessage} (errorCode: ${error.errorCode}) (errorId: ${error.errorId})`)),
                () => Promise.reject(new Error(`(status: ${response.status}) (statusText: ${response.statusText}) (url: ${response.url})`))
            );
    }
    return Promise.resolve(response);
}

function decodeAsJson<T>(response: Response): Promise<T> {
    return response.json();
}
