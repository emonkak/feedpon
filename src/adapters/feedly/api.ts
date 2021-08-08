import * as types from './types';
import httpClient from 'adapters/http/httpClient';

const ENDPOINT = 'https://cloud.feedly.com';

// Authentication API:
export function createAuthUrl(input: types.AuthenticateInput): string {
    return ENDPOINT + '/v3/auth/auth?' + new URLSearchParams({
        client_id: input.client_id,
        redirect_uri: input.redirect_uri,
        response_type: input.response_type,
        scope: input.scope
    }).toString();
}

export function authCallback(urlString: string): types.AuthenticateResponse {
    const paramsString = urlString.slice(urlString.indexOf('?') + 1);
    const params = new URLSearchParams(paramsString);

    return {
        code: params.get('code')!,
        state: params.get('state') ?? undefined,
        error: params.get('error') ?? undefined
    };
}

export function exchangeToken(input: types.ExchangeTokenInput): Promise<types.ExchangeTokenResponse> {
    return httpClient.postJson(ENDPOINT, '/v3/auth/token', input)
        .then<types.ExchangeTokenResponse>(handleJsonResponse);
}

export function refreshToken(input: types.RefreshTokenInput): Promise<types.RefreshTokenResponse> {
    return httpClient.postJson(ENDPOINT, '/v3/auth/token', input)
        .then<types.RefreshTokenResponse>(handleJsonResponse);
}

export function logout(accessToken: string): Promise<Response> {
    return httpClient.post(
        ENDPOINT,
        '/v3/auth/logout',
        null,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// Categories API:
export function getCategories(accessToken: string): Promise<types.Category[]> {
    return httpClient.get(ENDPOINT, '/v3/categories', null, createAuthHeader(accessToken))
        .then<types.Category[]>(handleJsonResponse);
}

export function changeCategoryLabel(accessToken: string, categoryId: string, label: string): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/categories/' + encodeURIComponent(categoryId),
        { label },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function deleteCategory(accessToken: string, categoryId: string): Promise<Response> {
    return httpClient.deleteJson(
        ENDPOINT,
        '/v3/categories/' + encodeURIComponent(categoryId),
        null,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// Feeds API:
export function getFeed(accessToken: string, feedId: string): Promise<types.Feed> {
    return httpClient.get(
        ENDPOINT,
        '/v3/feeds/' + encodeURIComponent(feedId),
        null,
        createAuthHeader(accessToken)
    ).then<types.Feed>(handleJsonResponse);
}

// Markers API:
export function getUnreadCounts(accessToken: string, input: types.GetUnreadCountsInput = {}): Promise<types.GetUnreadCountsResponce> {
    return httpClient.get(
        ENDPOINT,
        '/v3/markers/counts',
        input,
        createAuthHeader(accessToken)
    ).then<types.GetUnreadCountsResponce>(handleJsonResponse);
}

export function markAsReadForEntries(accessToken: string, entryIds: string | string[]): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/markers',
        {
            action: 'markAsRead',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function markAsReadForFeeds(accessToken: string, feedIds: string | string[]): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/markers',
        {
            action: 'markAsRead',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function markAsReadForCategories(accessToken: string, categoryIds: string | string[]): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/markers',
        {
            action: 'markAsRead',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function keepUnreadForEntries(accessToken: string, entryIds: string | string[]): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/markers',
        {
            action: 'keepUnread',
            type: 'entries',
            entryIds: Array.isArray(entryIds) ? entryIds : [entryIds]
        },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function keepUnreadForFeeds(accessToken: string, feedIds: string | string[]): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/markers',
        {
            action: 'keepUnread',
            type: 'feeds',
            feedIds: Array.isArray(feedIds) ? feedIds : [feedIds]
        },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function keepUnreadForCategories(accessToken: string, categoryIds: string | string[]): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/markers',
        {
            action: 'keepUnread',
            type: 'categories',
            categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds]
        },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// OPML API
export function createExportOpmlUrl(accessToken: string): string {
    return ENDPOINT + 'v3/opml?' + new URLSearchParams({
        feedlyToken: accessToken
    }).toString();
}

export function importOpml(accessToken: string, xmlString: string): Promise<Response> {
    return httpClient.postXml(
        ENDPOINT,
        '/v3/opml',
        xmlString,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// Profile API:
export function getProfile(accessToken: string): Promise<types.Profile> {
    return httpClient.get(
        ENDPOINT,
        '/v3/profile',
        null,
        createAuthHeader(accessToken)
    ).then<types.Profile>(handleJsonResponse);
}

export function updateProfile(accessToken: string, input: types.UpdateProfileInput): Promise<Response> {
    return httpClient.putJson(
        ENDPOINT,
        '/v3/profile',
        null,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// Search API:
export function searchFeeds(accessToken: string, input: types.SearchInput): Promise<types.SearchResponse> {
    return httpClient.get(
        ENDPOINT,
        '/v3/search/feeds',
        input,
        createAuthHeader(accessToken)
    ).then<types.SearchResponse>(handleJsonResponse);
}

// Streams API:
export function getStreamIds(accessToken: string, input: types.GetStreamInput): Promise<types.GetEntryIdsResponse> {
    return httpClient.get(
        ENDPOINT,
        '/v3/streams/ids',
        input,
        createAuthHeader(accessToken)
    ).then<types.GetEntryIdsResponse>(handleJsonResponse);
}

export function getStreamContents(accessToken: string, input: types.GetStreamInput): Promise<types.Contents> {
    return httpClient.get(
        ENDPOINT,
        '/v3/streams/contents',
        input,
        createAuthHeader(accessToken)
    ).then<types.Contents>(handleJsonResponse);
}

// Subscriptions API:
export function getSubscriptions(accessToken: string): Promise<types.Subscription[]> {
    return httpClient.get(
        ENDPOINT,
        '/v3/subscriptions',
        null,
        createAuthHeader(accessToken)
    ).then<types.Subscription[]>(handleJsonResponse);
}

export function subscribeFeed(accessToken: string, input: types.SubscribeFeedInput): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/subscriptions',
        input,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function unsubscribeFeed(accessToken: string, feedId: string): Promise<Response> {
    return httpClient.deleteJson(
        ENDPOINT,
        '/v3/subscriptions/' + encodeURIComponent(feedId),
        null,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// Tags API:
export function getTags(accessToken: string): Promise<types.Tag[]> {
    return httpClient.get(
        ENDPOINT,
        '/v3/tags',
        null,
        createAuthHeader(accessToken)
    ).then<types.Tag[]>(handleJsonResponse);
}

export function changeTagLabel(accessToken: string, tagId: string, label: string): Promise<Response> {
    return httpClient.postJson(
        ENDPOINT,
        '/v3/tags/' + encodeURIComponent(tagId),
        { label },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function setTag(accessToken: string, entryIds: string[], tagIds: string[]): Promise<Response> {
    return httpClient.putJson(
        ENDPOINT,
        '/v3/tags/' + encodeURIComponent(tagIds.join(',')),
        { entryIds },
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function unsetTag(accessToken: string, entryIds: string[], tagIds: string[]): Promise<Response> {
    return httpClient.deleteJson(
        ENDPOINT,
        '/v3/tags/' + encodeURIComponent(tagIds.join(',')) + '/' + encodeURIComponent(entryIds.join(',')),
        null,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

export function deleteTag(accessToken: string, tagIds: string[]): Promise<Response> {
    return httpClient.deleteJson(
        ENDPOINT,
        '/v3/tags/' + encodeURIComponent(tagIds.join(',')),
        null,
        createAuthHeader(accessToken)
    ).then(handleResponse);
}

// Utils:
function createAuthHeader(accessToken: string): { [key: string]: string } {
    return {
        'Authorization': 'OAuth ' + accessToken
    };
}

function handleResponse(response: Response): Promise<Response> {
    if (response.ok) {
        return Promise.resolve(response);
    } else {
        return handleError(response);
    }
}

function handleJsonResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
        return response.json();
    } else {
        return handleError(response);
    }
}

function handleError<T>(response: Response): Promise<T> {
    return response.json()
        .then(
            (error) => Promise.reject(new Error(`${error.errorMessage} (errorCode: ${error.errorCode}) (errorId: ${error.errorId})`)),
            () => Promise.reject(new Error(`(status: ${response.status}) (statusText: ${response.statusText}) (url: ${response.url})`))
        );
}
