export function getRequest<
  T extends { [K in keyof T]: string[] | string | number | boolean },
>(
  endpoint: string,
  path: string,
  params?: T | null,
  headers?: { [key: string]: string },
): Promise<Response> {
  let url = endpoint + path;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const name of Object.keys(params)) {
      const value = params[name as keyof T] as unknown;
      if (typeof value === 'boolean') {
        searchParams.append(name, value.toString());
      } else if (typeof value === 'number') {
        searchParams.append(name, value.toString());
      } else if (typeof value === 'string') {
        searchParams.append(name, value);
      } else if (Array.isArray(value)) {
        for (const v of value) {
          searchParams.append(name, v);
        }
      }
    }
    url += '?' + searchParams.toString();
  }

  const options = {
    method: 'GET',
    headers: new Headers(headers),
  };

  return fetch(url, options);
}

export function postRequest(
  endpoint: string,
  path: string,
  body?: BodyInit | null,
  headers?: { [key: string]: string },
): Promise<Response> {
  return fetch(endpoint + path, {
    method: 'POST',
    headers: new Headers(headers),
    body,
  });
}

export function postJson(
  endpoint: string,
  path: string,
  data: any,
  headers?: { [key: string]: string },
): Promise<Response> {
  return postRequest(endpoint, path, serializeAsJson(data), {
    'Content-Type': 'application/json',
    ...headers,
  });
}

export function postXml(
  endpoint: string,
  path: string,
  data: string,
  headers?: { [key: string]: string },
): Promise<Response> {
  return postRequest(endpoint, path, data, {
    'Content-Type': 'application/xml',
    ...headers,
  });
}

export function putRequest(
  endpoint: string,
  path: string,
  body?: BodyInit | null,
  headers?: { [key: string]: string },
): Promise<Response> {
  return fetch(endpoint + path, {
    method: 'PUT',
    headers: new Headers(headers),
    body,
  });
}

export function putJson(
  endpoint: string,
  path: string,
  data: any,
  headers?: { [key: string]: string },
): Promise<Response> {
  return putRequest(endpoint, path, serializeAsJson(data), {
    'Content-Type': 'application/json',
    ...headers,
  });
}

export function deleteRequest(
  endpoint: string,
  path: string,
  body?: BodyInit | null,
  headers?: { [key: string]: string },
): Promise<Response> {
  return fetch(endpoint + path, {
    method: 'DELETE',
    headers: new Headers(headers),
    body,
  });
}

export function deleteJson(
  endpoint: string,
  path: string,
  data: any,
  headers?: Record<string, string>,
): Promise<Response> {
  return deleteRequest(endpoint, path, serializeAsJson(data), {
    'Content-Type': 'application/json',
    ...headers,
  });
}

function serializeAsJson(
  data: string | object | null | undefined,
): string | null {
  return data != null ? JSON.stringify(data) : null;
}
