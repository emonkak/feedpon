import { getRequest, postJson } from '../httpClient';
import { createAuthHeader, handleJsonResponse, handleResponse } from './utils';

export interface GetUnreadCountsInput {
  autorefresh?: boolean;
  newerThan?: number;
  streamId?: string;
}

export interface GetUnreadCountsResponce {
  unreadcounts: UnreadCount[];
}

export interface UnreadCount {
  count: number;
  updated: number;
  id: string;
}

export async function getUnreadCounts(
  endPoint: string,
  accessToken: string,
  input: GetUnreadCountsInput = {},
): Promise<GetUnreadCountsResponce> {
  const response = await getRequest(
    endPoint,
    '/v3/markers/counts',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function markAsReadForEntries(
  endPoint: string,
  accessToken: string,
  entryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    endPoint,
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
  endPoint: string,
  accessToken: string,
  feedIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    endPoint,
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
  endPoint: string,
  accessToken: string,
  categoryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    endPoint,
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
  endPoint: string,
  accessToken: string,
  entryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    endPoint,
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
  endPoint: string,
  accessToken: string,
  feedIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    endPoint,
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
  endPoint: string,
  accessToken: string,
  categoryIds: string | string[],
): Promise<Response> {
  const response = await postJson(
    endPoint,
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
