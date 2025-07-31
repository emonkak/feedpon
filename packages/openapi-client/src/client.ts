import { ValidationError } from 'jsonschema';
import type { ParseJSONSchema } from 'jsonschema/dialects/typed.ts';
import {
  isJSONPointerURL,
  type ResolveJSONPointerURL,
  resolveJSONPointerURL,
} from 'jsonschema/pointer.ts';
import {
  defaultMiddleware,
  type Middleware,
  type RequestHandler,
} from './middleware.ts';
import { applyTemplateVariables } from './path.ts';
import { type ContentReader, defaultContentReader } from './reader.ts';
import { RequestResult } from './result.ts';
import {
  type ContentSerializer,
  defaultContentSerializer,
  defaultParameterSerializer,
  type ParameterSerializer,
} from './serializer.ts';
import type {
  Content,
  ContentType,
  Description,
  Responses as ExpectedResponses,
  MediaType,
  Method,
  Operation,
  Parameter,
  ParameterLocation,
  Reference,
  RequestBody,
  Response as ResponseDeclaration,
  StatusCode,
} from './types.ts';
import { defaultSchemaValidator, type SchemaValidator } from './validator.ts';

export interface ClientSettings {
  contentReader: ContentReader;
  contentSerializer: ContentSerializer;
  endPoint: string;
  middleware: Middleware;
  parameterSerializer: ParameterSerializer;
  requestHandler: RequestHandler;
  schemaValidator: SchemaValidator;
}

const defaultClientSettings: ClientSettings = {
  contentReader: defaultContentReader,
  contentSerializer: defaultContentSerializer,
  endPoint: '/',
  middleware: defaultMiddleware,
  parameterSerializer: defaultParameterSerializer,
  requestHandler: fetch,
  schemaValidator: defaultSchemaValidator,
};

type SuccessfulCode = `20${0 | 1 | 2 | 3 | 4 | 5 | 6}` | '2XX';

type ClientErrorCode =
  | `40${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | `41${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`
  | `42${1 | 2 | 6}`
  | `4XX`;

type ServerErrorCode = `50${0 | 1 | 2 | 3 | 4 | 5}` | `5XX`;

type ParsedContentType = { type: string; subtype: string };

type RequestOptions<
  TOperation extends Operation,
  TDocumentRoot,
> = (TOperation extends {
  parameters: {};
}
  ? ResolveRequestParameters<TOperation['parameters'], 'query', TDocumentRoot> &
      ResolveRequestParameters<
        TOperation['parameters'],
        'path',
        TDocumentRoot
      > &
      ResolveRequestParameters<
        TOperation['parameters'],
        'header',
        TDocumentRoot
      > &
      ResolveRequestParameters<
        TOperation['parameters'],
        'cookie',
        TDocumentRoot
      >
  : { [K in `${ParameterLocation}Params`]?: {} }) &
  (TOperation extends { requestBody: {} }
    ? ResolveRequestBody<
        ResolveReference<TOperation['requestBody'], RequestBody, TDocumentRoot>,
        TDocumentRoot
      >
    : { body?: undefined; contentType?: undefined }) &
  Omit<RequestInit, 'body' | 'method'>;

type ResponseBody<
  TOperation extends Operation,
  TStatusCode extends StatusCode,
  TDocumentRoot,
> = TOperation['responses'] extends {}
  ? {
      [K in TStatusCode]: TOperation['responses'][K] extends {}
        ? ResolveResponseBody<
            ResolveReference<
              TOperation['responses'][K],
              ResponseDeclaration,
              TDocumentRoot
            >,
            TDocumentRoot
          >
        : never;
    }[TStatusCode]
  : never;

type ResolveRequestParameters<
  TParameter extends (Parameter | Reference)[],
  TLocation extends ParameterLocation,
  TDocumentRoot,
> = ToOptional<{
  [K in `${TLocation}Params`]: ParseParameters<
    FilterArray<
      {
        [K in keyof TParameter]: ResolveReference<
          TParameter[K],
          Parameter,
          TDocumentRoot
        >;
      },
      { in: TLocation }
    >,
    TDocumentRoot
  >;
}>;

type ResolveRequestBody<
  TRequstBody extends RequestBody,
  TDocumentRoot,
> = SetOptional<
  ParseContent<TRequstBody['content'], TDocumentRoot>,
  IsRequired<TRequstBody> extends true ? never : any
>;

type ResolveResponseBody<
  TResponse extends ResponseDeclaration,
  TDocumentRoot,
> = TResponse['content'] extends {}
  ? ParseContent<TResponse['content'], TDocumentRoot>['body']
  : null; // Represent an empty response.

type ResolveReference<
  TReference extends TExpected | Reference,
  TExpected,
  TDocumentRoot,
> = TReference extends Reference
  ? Extract<ResolveJSONPointerURL<TReference['$ref'], TDocumentRoot>, TExpected>
  : TReference;

type ParseParameters<TParameter extends Parameter[], TDocumentRoot> = {
  [K in keyof TParameter]: SetOptional<
    {
      [N in TParameter[K]['name']]: ParseJSONSchema<
        NonNullable<TParameter[K]['schema']>,
        TDocumentRoot
      >;
    },
    IsRequired<TParameter[K]> extends true ? never : any
  >;
}[keyof TParameter];

type ParseContent<TContent extends Content, TDocumentRoot> = {
  [K in keyof TContent & ContentType]: {
    contentType: K;
    body: ParseJSONSchema<
      OrElse<
        ResolveReference<TContent[K], MediaType, TDocumentRoot>['schema'],
        {}
      >,
      TDocumentRoot
    >;
  };
}[keyof TContent & ContentType];

type FilterArray<TArray extends any[], TValue> = TArray extends [
  infer Head,
  ...infer Tail,
]
  ? [Head] extends [TValue]
    ? [Head, ...FilterArray<Tail, TValue>]
    : FilterArray<Tail, TValue>
  : [];

type OrElse<T, U> = T extends {} ? T : U;

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ToOptional<T> = SetOptional<
  T,
  {
    [K in keyof T]: RequiredKeys<T[K]> extends never ? never : K;
  }[any]
>;

type IsRequired<T> = T extends { required: true } ? true : false;

const CONTENT_TYPE_PATTERN = /(?<type>[A-Z]+)\/(?<subtype>[A-Z][0-9A-Z._-]*)/i;

export class OpenAPIClient<const TDescription extends Description> {
  private readonly _description: TDescription;

  private readonly _settings: ClientSettings;

  constructor(
    description: TDescription,
    settings: Partial<ClientSettings> = {},
  ) {
    this._description = description;
    this._settings = { ...defaultClientSettings, ...settings };
  }

  get description(): TDescription {
    return this._description;
  }

  get settings(): ClientSettings {
    return this._settings;
  }

  async request<
    const TMethod extends keyof TDescription['paths'][TPath] & Method,
    const TPath extends keyof TDescription['paths'] & string,
  >(
    method: TMethod,
    path: TPath,
    options: RequestOptions<
      NonNullable<TDescription['paths'][TPath][TMethod]>,
      TDescription
    >,
  ): Promise<
    RequestResult<
      ResponseBody<
        NonNullable<TDescription['paths'][TPath][TMethod]>,
        SuccessfulCode,
        TDescription
      >,
      ResponseBody<
        NonNullable<TDescription['paths'][TPath][TMethod]>,
        ClientErrorCode | ServerErrorCode | 'default',
        TDescription
      >
    >
  > {
    const { responses: responsesDeclaration = {} } =
      this._description.paths[path]![method]!;
    const { middleware, requestHandler } = this._settings;

    const request = this._createRequest(method, path, options);
    const response = await middleware(request, requestHandler);
    const responseBody = await this._parseResponseBody(
      request,
      response,
      responsesDeclaration,
    );

    return response.ok
      ? new RequestResult.Success(request, response, responseBody as any)
      : RequestResult.Failure.errorResponse(
          request,
          response,
          responseBody as any,
        );
  }

  private _createRequest<
    const TMethod extends keyof TDescription['paths'][TPath] & Method,
    const TPath extends keyof TDescription['paths'] & string,
  >(
    method: TMethod,
    path: TPath,
    {
      body,
      contentType,
      cookieParams = {},
      headerParams = {},
      headers: initialHeaders,
      pathParams = {},
      queryParams = {},
      ...restOptions
    }: RequestOptions<
      NonNullable<TDescription['paths'][TPath][TMethod]>,
      TDescription
    >,
  ): Request {
    const { parameters = [], requestBody: requestBodyDeclaration } =
      this._description.paths[path]![method]!;
    const {
      contentSerializer,
      parameterSerializer,
      endPoint,
      schemaValidator,
    } = this._settings;

    let requestBody: BodyInit | null;
    const headers = new Headers(initialHeaders);
    const searchParams = [];
    const templateVariables = new Map();

    for (let i = 0, l = parameters.length; i < l; i++) {
      const parameter = resolveReference(parameters[i]!, this._description);
      switch (parameter.in) {
        case 'query': {
          const value = schemaValidator(
            (queryParams as Record<string, unknown>)[parameter.name],
            parameter.schema ?? {},
            this._description,
          );
          const serializedValue = parameterSerializer(value, parameter);
          if (serializedValue !== '' || (parameter.allowEmptyValue ?? false)) {
            searchParams.push(serializedValue);
          }
          break;
        }
        case 'header': {
          const value = schemaValidator(
            (headerParams as Record<string, unknown>)[parameter.name],
            parameter.schema ?? {},
            this._description,
          );
          const serializedValue = parameterSerializer(value, parameter);
          headers.append(parameter.name, serializedValue);
          break;
        }
        case 'path': {
          const value = schemaValidator(
            (pathParams as Record<string, unknown>)[parameter.name],
            parameter.schema ?? {},
            this._description,
          );
          const serializedValue = parameterSerializer(value, parameter);
          templateVariables.set(parameter.name, serializedValue);
          break;
        }
        case 'cookie': {
          const value = schemaValidator(
            (cookieParams as Record<string, unknown>)[parameter.name],
            parameter.schema ?? {},
            this._description,
          );
          const serializedValue = parameterSerializer(value, parameter);
          headers.append('Set-Cookie', serializedValue);
          break;
        }
      }
    }

    if (contentType !== undefined) {
      const mediaType = resolveReference(
        resolveReference(requestBodyDeclaration!, this._description).content[
          contentType
        ]!,
        this._description,
      );
      requestBody = contentSerializer(body, contentType, mediaType);
      headers.append('content-type', contentType);
    } else {
      requestBody = null;
    }

    const finalPath =
      templateVariables.size > 0
        ? applyTemplateVariables(path, templateVariables)
        : path;
    const url =
      endPoint +
      finalPath +
      (searchParams.length > 0 ? '?' + searchParams.join('&') : '');

    return new Request(url, {
      body: requestBody,
      headers,
      method,
      ...restOptions,
    });
  }

  private async _parseResponseBody(
    request: Request,
    response: Response,
    expectedResponses: ExpectedResponses,
  ): Promise<unknown> {
    const responseDeclaration = getResponseDeclaration(
      response,
      expectedResponses,
      this._description,
    );

    if (responseDeclaration === null) {
      throw RequestResult.Failure.undefinedResponse(request, response);
    }

    if (responseDeclaration.content === undefined) {
      // Assume the response body is empty.
      return null;
    }

    const contentType = response.headers.get('content-type');
    const parsedContentType =
      contentType !== null ? parseContentType(contentType) : null;

    if (parsedContentType === null) {
      throw RequestResult.Failure.unknownContent(request, response);
    }

    const mediaType = getResponseMediaType(
      parsedContentType,
      responseDeclaration.content,
      this._description,
    );

    if (mediaType === null) {
      throw RequestResult.Failure.unsupportedContent(request, response);
    }

    const { contentReader, schemaValidator } = this._settings;
    const responseBody = await contentReader(
      response,
      `${parsedContentType.type}/${parsedContentType.subtype}`,
      mediaType,
    );

    try {
      return schemaValidator(
        responseBody,
        mediaType.schema ?? {},
        this._description,
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        throw RequestResult.Failure.invalidBody(request, response, {
          cause: error,
        });
      }
      throw error;
    }
  }
}

function getResponseDeclaration(
  response: Response,
  expectedResponses: ExpectedResponses,
  documentRoot: object,
): ResponseDeclaration | null {
  const statusCode = response.status.toString() as StatusCode;
  const responseDeclaration =
    expectedResponses[statusCode] ??
    expectedResponses[(statusCode[0] + 'XX') as StatusCode] ??
    (response.ok ? undefined : expectedResponses.default);
  if (responseDeclaration === undefined) {
    return null;
  }
  return resolveReference(responseDeclaration, documentRoot);
}

function getResponseMediaType(
  { type, subtype }: ParsedContentType,
  contentDeclaration: Content,
  references: object,
): MediaType | null {
  const mediaType =
    contentDeclaration[`${type}/${subtype}`] ??
    contentDeclaration[`${type}/*`] ??
    contentDeclaration['*/*'];
  if (mediaType === undefined) {
    return null;
  }
  return resolveReference(mediaType, references);
}

function parseContentType(input: string): ParsedContentType | null {
  return (
    (input.toLowerCase().match(CONTENT_TYPE_PATTERN)
      ?.groups as ParsedContentType) ?? null
  );
}

export function resolveReference<T extends object>(
  schema: T | Reference,
  documentRoot: object,
): T {
  if ('$ref' in schema) {
    const referencedSchema = isJSONPointerURL(schema.$ref)
      ? resolveJSONPointerURL(schema.$ref, documentRoot)
      : null;
    if (referencedSchema === null) {
      throw new Error(`Unresolved reference: ${JSON.stringify(schema.$ref)}`);
    }
    return referencedSchema as T;
  } else {
    return schema;
  }
}
