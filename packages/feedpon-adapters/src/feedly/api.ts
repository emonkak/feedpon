import * as types from './types';
import {
  putJson,
  getRequest,
  postJson,
  postXml,
  postRequest,
  deleteJson,
} from '../httpClient';

const ENDPOINT = 'https://cloud.feedly.com';

// Authentication API:
export function createAuthUrl(input: types.AuthenticateInput): string {
  return (
    ENDPOINT +
    '/v3/auth/auth?' +
    new URLSearchParams({
      client_id: input.client_id,
      redirect_uri: input.redirect_uri,
      response_type: input.response_type,
      scope: input.scope,
    }).toString()
  );
}

export function authCallback(urlString: string): types.AuthenticateResponse {
  const paramsString = urlString.slice(urlString.indexOf('?') + 1);
  const params = new URLSearchParams(paramsString);

  return {
    code: params.get('code')!,
    state: params.get('state') ?? undefined,
    error: params.get('error') ?? undefined,
  };
}

export async function exchangeToken(
  input: types.ExchangeTokenInput,
): Promise<types.ExchangeTokenResponse> {
  const response = await postJson(ENDPOINT, '/v3/auth/token', input);
  return handleJsonResponse(response);
}

export async function refreshToken(
  input: types.RefreshTokenInput,
): Promise<types.RefreshTokenResponse> {
  const response = await postJson(ENDPOINT, '/v3/auth/token', input);
  return handleJsonResponse(response);
}

export async function logout(accessToken: string): Promise<Response> {
  const response = await postRequest(
    ENDPOINT,
    '/v3/auth/logout',
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// Categories API:
export async function getCategories(
  accessToken: string,
): Promise<types.Category[]> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/categories',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function changeCategoryLabel(
  accessToken: string,
  categoryId: string,
  label: string,
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/categories/' + encodeURIComponent(categoryId),
    { label },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function deleteCategory(
  accessToken: string,
  categoryId: string,
): Promise<Response> {
  const response = await deleteJson(
    ENDPOINT,
    '/v3/categories/' + encodeURIComponent(categoryId),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// Feeds API:
export async function getFeed(
  accessToken: string,
  feedId: string,
): Promise<types.Feed> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/feeds/' + encodeURIComponent(feedId),
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

// Markers API:
export async function getUnreadCounts(
  accessToken: string,
  input: types.GetUnreadCountsInput = {},
): Promise<types.GetUnreadCountsResponce> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/markers/counts',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function markAsReadForEntries(
  accessToken: string,
  entryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/markers',
    {
      action: 'markAsRead',
      type: 'entries',
      entryIds: Array.isArray(entryIds) ? entryIds : [entryIds],
    },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function markAsReadForFeeds(
  accessToken: string,
  feedIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/markers',
    {
      action: 'markAsRead',
      type: 'feeds',
      feedIds: Array.isArray(feedIds) ? feedIds : [feedIds],
    },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function markAsReadForCategories(
  accessToken: string,
  categoryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/markers',
    {
      action: 'markAsRead',
      type: 'categories',
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds],
    },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function keepUnreadForEntries(
  accessToken: string,
  entryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/markers',
    {
      action: 'keepUnread',
      type: 'entries',
      entryIds: Array.isArray(entryIds) ? entryIds : [entryIds],
    },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function keepUnreadForFeeds(
  accessToken: string,
  feedIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/markers',
    {
      action: 'keepUnread',
      type: 'feeds',
      feedIds: Array.isArray(feedIds) ? feedIds : [feedIds],
    },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function keepUnreadForCategories(
  accessToken: string,
  categoryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/markers',
    {
      action: 'keepUnread',
      type: 'categories',
      categoryIds: Array.isArray(categoryIds) ? categoryIds : [categoryIds],
    },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// OPML API
export function createExportOpmlUrl(accessToken: string): string {
  return (
    ENDPOINT +
    'v3/opml?' +
    new URLSearchParams({
      feedlyToken: accessToken,
    }).toString()
  );
}

export async function importOpml(
  accessToken: string,
  xmlString: string,
): Promise<Response> {
  const response = await postXml(
    ENDPOINT,
    '/v3/opml',
    xmlString,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// Profile API:
export async function getProfile(accessToken: string): Promise<types.Profile> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/profile',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function updateProfile(
  accessToken: string,
  _input: types.UpdateProfileInput,
): Promise<Response> {
  const response = await putJson(
    ENDPOINT,
    '/v3/profile',
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// Search API:
export async function searchFeeds(
  accessToken: string,
  input: types.SearchInput,
): Promise<types.SearchResponse> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/search/feeds',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

// Streams API:
export async function getStreamIds(
  accessToken: string,
  input: types.GetStreamInput,
): Promise<types.GetEntryIdsResponse> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/streams/ids',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function getStreamContents(
  accessToken: string,
  input: types.GetStreamInput,
): Promise<types.Contents> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/streams/contents',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

// Subscriptions API:
export async function getSubscriptions(
  accessToken: string,
): Promise<types.Subscription[]> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/subscriptions',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function subscribeFeed(
  accessToken: string,
  input: types.SubscribeFeedInput,
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/subscriptions',
    input,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function unsubscribeFeed(
  accessToken: string,
  feedId: string,
): Promise<Response> {
  const response = await deleteJson(
    ENDPOINT,
    '/v3/subscriptions/' + encodeURIComponent(feedId),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// Tags API:
export async function getTags(accessToken: string): Promise<types.Tag[]> {
  const response = await getRequest(
    ENDPOINT,
    '/v3/tags',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function changeTagLabel(
  accessToken: string,
  tagId: string,
  label: string,
): Promise<Response> {
  const response = await postJson(
    ENDPOINT,
    '/v3/tags/' + encodeURIComponent(tagId),
    { label },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function setTag(
  accessToken: string,
  entryIds: string[],
  tagIds: string[],
): Promise<Response> {
  const response = await putJson(
    ENDPOINT,
    '/v3/tags/' + encodeURIComponent(tagIds.join(',')),
    { entryIds },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function unsetTag(
  accessToken: string,
  entryIds: string[],
  tagIds: string[],
): Promise<Response> {
  const response = await deleteJson(
    ENDPOINT,
    '/v3/tags/' +
      encodeURIComponent(tagIds.join(',')) +
      '/' +
      encodeURIComponent(entryIds.join(',')),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function deleteTag(
  accessToken: string,
  tagIds: string[],
): Promise<Response> {
  const response = await deleteJson(
    ENDPOINT,
    '/v3/tags/' + encodeURIComponent(tagIds.join(',')),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

// Utils:
function createAuthHeader(accessToken: string): { [key: string]: string } {
  return {
    Authorization: 'OAuth ' + accessToken,
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
  return response.json().then(
    (error) =>
      Promise.reject(
        new Error(
          `${error.errorMessage} (errorCode: ${error.errorCode}) (errorId: ${error.errorId})`,
        ),
      ),
    () =>
      Promise.reject(
        new Error(
          `(status: ${response.status}) (statusText: ${response.statusText}) (url: ${response.url})`,
        ),
      ),
  );
}
