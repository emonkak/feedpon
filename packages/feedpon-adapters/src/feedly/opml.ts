import { postXml } from '../httpClient';
import { createAuthHeader, handleResponse } from './utils';

export function createExportOpmlUrl(
  endPoint: string,
  accessToken: string,
): string {
  return (
    endPoint +
    'v3/opml?' +
    new URLSearchParams({
      feedlyToken: accessToken,
    }).toString()
  );
}

export async function importOpml(
  endPoint: string,
  accessToken: string,
  xmlString: string,
): Promise<Response> {
  const response = await postXml(
    endPoint,
    '/v3/opml',
    xmlString,
    createAuthHeader(accessToken),
  );
  return handleResponse(response);
}
