import { getRequest } from '../httpClient';
import { createAuthHeader, handleJsonResponse } from './utils';
import type { Category } from './categories';
import type { Tag } from './tags';

export interface GetStreamInput {
  streamId: string;
  count?: number;
  ranked?: 'newest' | 'oldest';
  unreadOnly?: boolean;
  newerThan?: number;
  continuation?: string;
}

export interface GetEntryIdsResponse {
  ids: string[];
  continuation: string;
}

export interface Contents {
  continuation?: string;
  updated: number;
  alternate: Link[];
  title: string;
  id: string;
  direction: string;
  items: Entry[];
}

export interface Entry {
  id: string;
  title: string;
  content?: Content;
  summary?: Content;
  author?: string;
  crawled: number;
  recrawled?: number;
  published: number;
  updated?: number;
  alternate?: Link[];
  origin?: Origin;
  keywords?: string[];
  visual?: Visual;
  unread: boolean;
  tags?: Tag[];
  categories?: Category[];
  engagement?: number;
  engagementRate?: number;
  actionTimestamp?: number;
  enclosure?: Link[];
  fingerprint: string;
  originId: string;
  sid?: string;
  memes?: Meme[];
  // Undocumented properities:
  language?: string;
  canonicalUrl?: string;
  ampUrl?: string;
  cdnAmpUrl?: string;
}

export interface Content {
  direction: string;
  content: string;
}

export interface Link {
  type: string;
  href: string;
}

export interface Origin {
  htmlUrl: string;
  title: string;
  streamId: string;
}

export interface Visual {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
  edgeCacheUrl?: string;
  expirationDate?: string;
  processor?: string;
}

export interface Meme {
  id: string;
  label: string;
  score: string;
}

export async function getStreamIds(
  endPoint: string,
  accessToken: string,
  input: GetStreamInput,
): Promise<GetEntryIdsResponse> {
  const response = await getRequest(
    endPoint,
    '/v3/streams/ids',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}

export async function getStreamContents(
  endPoint: string,
  accessToken: string,
  input: GetStreamInput,
): Promise<Contents> {
  const response = await getRequest(
    endPoint,
    '/v3/streams/contents',
    input,
    createAuthHeader(accessToken),
  );
  return handleJsonResponse(response);
}
