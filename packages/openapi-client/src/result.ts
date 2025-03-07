export type RequestResult<TSuccess, TError> =
  | RequestResult.Success<TSuccess>
  | RequestResult.Failure<TError>;

export namespace RequestResult {
  export class Success<T> {
    private readonly _request: Request;

    private readonly _response: Response;

    private readonly _body: T;

    constructor(request: Request, response: Response, body: T) {
      this._request = request;
      this._response = response;
      this._body = body;
    }

    get ok(): true {
      return true;
    }

    get request(): Request {
      return this._request;
    }

    get response(): Response {
      return this._response;
    }

    get body(): T {
      return this._body;
    }

    unwrap(): T {
      return this._body;
    }
  }

  export class Failure<T> extends Error {
    private readonly _request: Request;

    private readonly _response: Response;

    private readonly _body: T;

    static erorrResponse<T>(
      request: Request,
      response: Response,
      body: T,
      options?: ErrorOptions,
    ): Failure<T> {
      return new Failure(
        `The request to "${request.url}" returned "${response.status} ${response.statusText}" and received ${JSON.stringify(body)}.`,
        request,
        response,
        body,
        options,
      );
    }

    static invalidResponseBody(
      request: Request,
      response: Response,
      options?: ErrorOptions,
    ): Failure<null> {
      return new Failure(
        'The response body does not satisfy the schema.',
        request,
        response,
        null,
        options,
      );
    }

    static undefinedResponse(
      request: Request,
      response: Response,
      options?: ErrorOptions,
    ): Failure<null> {
      return new Failure(
        `The response for status code ${response.status} is undefined.`,
        request,
        response,
        null,
        options,
      );
    }

    static unknownContent(
      request: Request,
      response: Response,
      options?: ErrorOptions,
    ): Failure<null> {
      return new Failure(
        'The content type for the response is unknown.',
        request,
        response,
        null,
        options,
      );
    }

    static unsupportedContent(
      request: Request,
      response: Response,
      options?: ErrorOptions,
    ): Failure<null> {
      return new Failure(
        `The response of content "${response.headers.get('content-type')}" is unsupported.`,
        request,
        response,
        null,
        options,
      );
    }

    private constructor(
      message: string,
      request: Request,
      response: Response,
      body: T,
      options?: ErrorOptions,
    ) {
      super(message, options);
      this._request = request;
      this._response = response;
      this._body = body;
    }

    get ok(): false {
      return false;
    }

    get request(): Request {
      return this._request;
    }

    get response(): Response {
      return this._response;
    }

    get body(): T {
      return this._body;
    }

    unwrap(): never {
      throw this;
    }
  }
}
