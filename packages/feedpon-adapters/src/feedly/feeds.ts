import { getRequest } from '../httpClient';
import { createAuthHeader, handleJsonResponse } from './utils';

export interface Feed {
  id: string;
  subscribers?: number;
  title: string;
  description?: string;
  language?: string;
  velocity?: number;
  website?: string;
  topics?: string[];
  status?: 'dead' | 'dead.flooded';

  // Undocumented properties:
  contentType: string;
  coverColor: string;
  iconUrl?: string;
  partial: boolean;
  visualUrl?: string;
}

export async function getFeed(
  endPoint: string,
  accessToken: string,
  feedId: string,
): Promise<Feed> {
  const response = await getRequest(
    endPoint,
    '/v3/feeds/' + encodeURIComponent(feedId),
    null,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}
