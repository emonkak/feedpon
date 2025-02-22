import type { Client, FetchOptions, FetchResponse } from 'openapi-fetch';
import type {
  HttpMethod,
  MediaType,
  PathsWithMethod,
} from 'openapi-typescript-helpers';

export default async function request<
  TPathInfo extends Record<string, Record<HttpMethod, {}>>,
  TMedia extends MediaType,
  TMethod extends HttpMethod,
  TPath extends PathsWithMethod<TPathInfo, TMethod>,
  TInit extends FetchOptions<TPathInfo[TPath][TMethod]>,
>(
  client: Client<TPathInfo, TMedia>,
  method: TMethod,
  path: TPath,
  init: TInit,
): Promise<NonNullable<FetchResponse<TPathInfo, TInit, TMedia>['data']>> {
  const { error, data } = await client.request(method, path, init);
  if (error !== undefined) {
    throw error;
  }
  return data!;
}
