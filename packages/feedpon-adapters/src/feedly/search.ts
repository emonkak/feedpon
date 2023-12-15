import { getRequest } from '../httpClient';
import { createAuthHeader, handleJsonResponse } from './utils';

export interface SearchInput {
  query: string;
  count?: number;
  locale?: string;
}

export interface SearchResponse {
  hint: string;
  related: string[];
  results: SearchResult[];
}

export interface SearchResult {
  feedId: string;
  subscribers: number;
  title: string;
  description?: string;
  language?: string;
  velocity?: number;
  website?: string;
  visualUrl?: string;
  lastUpdated?: number;

  // Undocumented properties:
  art: number;
  contentType: string;
  coverColor: string;
  coverage: number;
  coverageScore: number;
  deliciousTags: string[];
  estimatedEngagement: number;
  hint: string;
  iconUrl?: string;
  partial: boolean;
  scheme: string;
  score: number;
}

export async function searchFeeds(
  endPoint: string,
  accessToken: string,
  input: SearchInput,
): Promise<SearchResponse> {
  const response = await getRequest(
    endPoint,
    '/v3/search/feeds',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}
