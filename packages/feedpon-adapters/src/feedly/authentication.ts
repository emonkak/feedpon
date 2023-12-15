import { postJson, postRequest } from '../httpClient';
import { createAuthHeader, handleJsonResponse, handleResponse } from './utils';

export interface AuthenticateInput {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  scope: string;
  state?: string;
}

export interface AuthenticateResponse {
  code: string;
  state?: string;
  error?: string;
}

export interface ExchangeTokenInput {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  state?: string;
  grant_type: 'authorization_code';
}

export interface ExchangeTokenResponse {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  plan: string;
  state?: string;
}

export interface RefreshTokenInput {
  refresh_token: string;
  client_id: string;
  client_secret: string;
  grant_type: 'refresh_token';
}

export interface RefreshTokenResponse {
  id: string;
  plan: string;
  access_token: string;
  expires_in: number;
  token_type: string;
}

export function createAuthUrl(
  endPoint: string,
  input: AuthenticateInput,
): string {
  return (
    endPoint +
    '/v3/auth/auth?' +
    new URLSearchParams({
      client_id: input.client_id,
      redirect_uri: input.redirect_uri,
      response_type: input.response_type,
      scope: input.scope,
    }).toString()
  );
}

export function authCallback(urlString: string): AuthenticateResponse {
  const paramsString = urlString.slice(urlString.indexOf('?') + 1);
  const params = new URLSearchParams(paramsString);

  return {
    code: params.get('code')!,
    state: params.get('state') ?? undefined,
    error: params.get('error') ?? undefined,
  };
}

export async function exchangeToken(
  endPoint: string,
  input: ExchangeTokenInput,
): Promise<ExchangeTokenResponse> {
  const response = await postJson(endPoint, '/v3/auth/token', input);
  return handleJsonResponse(response);
}

export async function refreshToken(
  endPoint: string,
  input: RefreshTokenInput,
): Promise<RefreshTokenResponse> {
  const response = await postJson(endPoint, '/v3/auth/token', input);
  return handleJsonResponse(response);
}

export async function logout(
  endPoint: string,
  accessToken: string,
): Promise<Response> {
  const response = await postRequest(
    endPoint,
    '/v3/auth/logout',
    null,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}
