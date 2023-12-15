import { putJson, postJson, getRequest, deleteJson } from '../httpClient';
import { createAuthHeader, handleJsonResponse, handleResponse } from './utils';

export interface Tag {
  id: string;
  label?: string;
  description?: string;
}

export async function getTags(
  endPoint: string,
  accessToken: string,
): Promise<Tag[]> {
  const response = await getRequest(
    endPoint,
    '/v3/tags',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function changeTagLabel(
  endPoint: string,
  accessToken: string,
  tagId: string,
  label: string,
): Promise<Response> {
  const response = await postJson(
    endPoint,
    '/v3/tags/' + encodeURIComponent(tagId),
    { label },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function setTag(
  endPoint: string,
  accessToken: string,
  entryIds: string[],
  tagIds: string[],
): Promise<Response> {
  const response = await putJson(
    endPoint,
    '/v3/tags/' + encodeURIComponent(tagIds.join(',')),
    { entryIds },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function unsetTag(
  endPoint: string,
  accessToken: string,
  entryIds: string[],
  tagIds: string[],
): Promise<Response> {
  const response = await deleteJson(
    endPoint,
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
  endPoint: string,
  accessToken: string,
  tagIds: string[],
): Promise<Response> {
  const response = await deleteJson(
    endPoint,
    '/v3/tags/' + encodeURIComponent(tagIds.join(',')),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}
