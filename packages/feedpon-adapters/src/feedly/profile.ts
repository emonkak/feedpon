import { getRequest, putJson } from '../httpClient';
import { createAuthHeader, handleJsonResponse, handleResponse } from './utils';

export interface Profile {
  id: string;
  email?: string;
  givenName?: string;
  familyName?: string;
  fullName?: string;
  picture?: string;
  gender?: string;
  locale?: string;
  google?: string;
  reader?: string;
  twitter?: string;
  twitterUserId?: string;
  facebookUserId?: string;
  wordPressId?: string;
  windowsLiveId?: string;
  wave: string;
  client: string;
  source: string;
  created?: number;

  // Pro accounts only:
  product?: string;
  productExpiration?: number;
  subscriptionStatus?:
    | 'Active'
    | 'PastDue'
    | 'Canceled'
    | 'Unpaid'
    | 'Deleted'
    | 'Expired';
  isEvernoteConnected?: boolean;
  isPocketConnected?: boolean;
}

export interface UpdateProfileInput {
  email?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  gender?: string;
  locale?: boolean;
  twitter?: string;
  facebook?: string;
}

export async function getProfile(
  endPoint: string,
  accessToken: string,
): Promise<Profile> {
  const response = await getRequest(
    endPoint,
    '/v3/profile',
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function updateProfile(
  endPoint: string,
  accessToken: string,
  input: UpdateProfileInput,
): Promise<Response> {
  const response = await putJson(
    endPoint,
    '/v3/profile',
    input,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}
