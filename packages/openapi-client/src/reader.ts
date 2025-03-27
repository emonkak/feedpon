import type { ContentType, MediaType } from './types.ts';

export type ContentReader = (
  response: Response,
  type: ContentType,
  media: MediaType,
) => Promise<unknown>;

export const defaultContentReader: ContentReader = (
  response: Response,
  contentType: ContentType,
) => {
  switch (contentType) {
    case 'application/json':
      return response.json();
    case 'application/octet-stream':
      return response.blob();
    case 'text/plain':
      return response.text();
  }
  throw new Error(
    'Attempted to read an unsupported content type:' +
      JSON.stringify(contentType),
  );
};
