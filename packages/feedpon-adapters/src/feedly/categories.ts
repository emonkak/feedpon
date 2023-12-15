import { getRequest, postJson, deleteJson } from '../httpClient';
import { createAuthHeader, handleJsonResponse, handleResponse } from './utils';

export interface Category {
  id: string;
  label: string;
}

export async function getCategories(
  endPoint: string,
  accessToken: string,
): Promise<Category[]> {
  const response = await getRequest(
    endPoint,
    '/v3/categories',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function changeCategoryLabel(
  endPoint: string,
  accessToken: string,
  categoryId: string,
  label: string,
): Promise<Response> {
  const response = await postJson(
    endPoint,
    '/v3/categories/' + encodeURIComponent(categoryId),
    { label },
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}

export async function deleteCategory(
  endPoint: string,
  accessToken: string,
  categoryId: string,
): Promise<Response> {
  const response = await deleteJson(
    endPoint,
    '/v3/categories/' + encodeURIComponent(categoryId),
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}
