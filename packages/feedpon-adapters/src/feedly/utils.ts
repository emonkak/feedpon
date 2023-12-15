interface FeedlyError {
  errorCode: number;
  errorId: string;
  errorMessage: string;
}

export function createAuthHeader(accessToken: string): {
  [key: string]: string;
} {
  return {
    Authorization: 'OAuth ' + accessToken,
  };
}

export function handleResponse(response: Response): Promise<Response> {
  if (response.ok) {
    return Promise.resolve(response);
  } else {
    return handleErrorResponse(response);
  }
}

export function handleJsonResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json();
  } else {
    return handleErrorResponse(response);
  }
}

export function handleErrorResponse<T>(response: Response): Promise<T> {
  return response.json().then(
    (error: FeedlyError) =>
      Promise.reject(
        new Error(
          `${error.errorMessage} (errorCode: ${error.errorCode}) (errorId: ${error.errorId})`,
        ),
      ),
    () =>
      Promise.reject(
        new Error(
          `(status: ${response.status}) (statusText: ${response.statusText}) (url: ${response.url})`,
        ),
      ),
  );
}
