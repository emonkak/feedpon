import type { Category } from './categories';
import { postJson, getRequest, deleteJson } from '../httpClient';
import { createAuthHeader, handleJsonResponse, handleResponse } from './utils';

export interface SubscribeFeedInput {
  categories: Category[];
  id: string;
  title?: string;
}

export interface Subscription {
  id: string;
  title: string;
  website: string;
  categories: Category[];
  updated: number;
  velocity: number;
  topics: string[];
  visualUrl?: string;
  iconUrl?: string;
}

export async function getSubscriptions(
  endPoint: string,
  accessToken: string,
): Promise<Subscription[]> {
  const response = await getRequest(
    endPoint,
    '/v3/subscriptions',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function subscribeFeed(
  endPoint: string,
  accessToken: string,
  input: SubscribeFeedInput,
): Promise<Response> {
  const response = await postJson(
    endPoint,
    '/v3/subscriptions',
    input,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function unsubscribeFeed(
  endPoint: string,
  accessToken: string,
  feedId: string,
): Promise<Response> {
  const response = await deleteJson(
    endPoint,
    '/v3/subscriptions/' + encodeURIComponent(feedId),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}
