import type { AllOf, Filter, OrElse, RequiredKeys } from './helpers.ts';
import {
  type Middleware,
  type RequestHandler,
  defaultMiddleware,
} from './middleware.ts';
import type {
  Content,
  ContentType,
  Description,
  MediaType,
  Method,
  Operation,
  Parameter,
  ParameterLocation,
  Reference,
  RequestBody,
  Response as ResponseDefinition,
  Responses as ResponsesDefinition,
  StatusCode,
} from './openapi.ts';
import { applyTemplateVariables } from './path.ts';
import { type ContentReader, defaultContentReader } from './reader.ts';
import { RequestResult } from './result.ts';
import {
  type LookupReference,
  type ParseSchema,
  lookupReference,
} from './schema.ts';
import {
  type ContentSerializer,
  type ParameterSerializer,
  defaultContentSerializer,
  defaultParameterSerializer,
} from './serializer.ts';
import {
  type SchemaValidator,
  ValidationError,
  defaultSchemaValidator,
} from './validator.ts';

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

type RequestOptions<T extends Operation, TDocumentRoot> = (T extends {
  parameters: {};
}
  ? ResolveRequestParameters<T['parameters'], 'query', TDocumentRoot> &
      ResolveRequestParameters<T['parameters'], 'path', TDocumentRoot> &
      ResolveRequestParameters<T['parameters'], 'header', TDocumentRoot> &
      ResolveRequestParameters<T['parameters'], 'cookie', TDocumentRoot>
  : { [K in `${ParameterLocation}Params`]?: {} }) &
  (T extends { requestBody: {} }
    ? ResolveRequestBody<
        ResolveReference<T['requestBody'], RequestBody, TDocumentRoot>,
        TDocumentRoot
      >
    : { body?: undefined; contentType?: undefined }) &
  Omit<RequestInit, 'body' | 'method'>;

type ResponseBody<
  T extends Operation,
  TStatusCode extends StatusCode,
  TDocumentRoot,
> = T['responses'] extends {}
  ? {
      [K in TStatusCode]: T['responses'][K] extends {}
        ? ResolveResponseBody<
            ResolveReference<
              T['responses'][K],
              ResponseDefinition,
              TDocumentRoot
            >,
            TDocumentRoot
          >
        : never;
    }[TStatusCode]
  : never;

type ResolveRequestParameters<
  T extends (Parameter | Reference)[],
  TLocation extends ParameterLocation,
  TDocumentRoot,
> = ToOptional<{
  [K in `${TLocation}Params`]: ParseParameters<
    Filter<
      {
        [K in keyof T]: ResolveReference<T[K], Parameter, TDocumentRoot>;
      },
      { in: TLocation }
    >,
    TDocumentRoot
  >;
}>;

type ResolveRequestBody<T extends RequestBody, TDocumentRoot> = SetOptional<
  ParseContent<T['content'], TDocumentRoot>,
  IsRequired<T> extends true ? never : any
>;

type ResolveResponseBody<
  T extends ResponseDefinition,
  TDocumentRoot,
> = T['content'] extends {}
  ? ParseContent<T['content'], TDocumentRoot>['body']
  : null; // Represent an empty response.

type ResolveReference<
  T extends TExpected | Reference,
  TExpected,
  TDocumentRoot,
> = T extends Reference
  ? Extract<LookupReference<T['$ref'], TDocumentRoot>, TExpected>
  : T;

type ParseParameters<T extends Parameter[], TDocumentRoot> = AllOf<{
  [K in keyof T]: SetOptional<
    {
      [N in T[K]['name']]: ParseSchema<
        NonNullable<T[K]['schema']>,
        TDocumentRoot
      >;
    },
    IsRequired<T[K]> extends true ? never : any
  >;
}>;

type ParseContent<T extends Content, TDocumentRoot> = {
  [K in keyof T & ContentType]: {
    contentType: K;
    body: ParseSchema<
      OrElse<ResolveReference<T[K], MediaType, TDocumentRoot>['schema'], {}>,
      TDocumentRoot
    >;
  };
}[keyof T & ContentType];

type SetOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ToOptional<T> = SetOptional<
  T,
  {
    [K in keyof T]: RequiredKeys<T[K]> extends never ? never : K;
  }[any]
>;

type IsRequired<T> = T extends { required: true } ? true : false;

const CONTENT_TYPE_PATTERN = /(?<type>[A-Z]+)\/(?<subtype>[A-Z][0-9A-Z._-]*)/i;

export class Client<const TDescription extends Description> {
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
    const { responses: responsesDefinition = {} } =
      this._description.paths[path]![method]!;
    const { middleware, requestHandler } = this._settings;

    const request = this._createRequest(method, path, options);
    const response = await middleware(request, requestHandler);
    const responseBody = await this._parseResponseBody(
      request,
      response,
      responsesDefinition,
    );

    return response.ok
      ? new RequestResult.Success(request, response, responseBody as any)
      : RequestResult.Failure.erorrResponse(
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
    const { parameters = [], requestBody: requestBodyDefinition } =
      this._description.paths[path]![method]!;
    const {
      contentSerializer,
      parameterSerializer,
      endPoint,
      schemaValidator,
    } = this._settings;

    let requestBody;
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
        resolveReference(requestBodyDefinition!, this._description).content[
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
    responsesDefinition: ResponsesDefinition,
  ): Promise<unknown> {
    const responseDefinition = getResponseDefinition(
      response,
      responsesDefinition,
      this._description,
    );

    if (responseDefinition === null) {
      throw RequestResult.Failure.undefinedResponse(request, response);
    }

    if (responseDefinition.content === undefined) {
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
      responseDefinition.content,
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
        throw RequestResult.Failure.invalidResponseBody(request, response, {
          cause: error,
        });
      }
      throw error;
    }
  }
}

function getResponseDefinition(
  response: Response,
  responsesDefinition: ResponsesDefinition,
  references: object,
): ResponseDefinition | null {
  const statusCode = response.status.toString() as StatusCode;
  const responseDefinition =
    responsesDefinition[statusCode] ??
    responsesDefinition[(statusCode[0] + 'XX') as StatusCode] ??
    (response.ok ? undefined : responsesDefinition.default);
  if (responseDefinition === undefined) {
    return null;
  }
  return resolveReference(responseDefinition, references);
}

function getResponseMediaType(
  { type, subtype }: ParsedContentType,
  contentDefinition: Content,
  references: object,
): MediaType | null {
  const mediaType =
    contentDefinition[`${type}/${subtype}`] ??
    contentDefinition[`${type}/*`] ??
    contentDefinition['*/*'];
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
  return '$ref' in schema
    ? (lookupReference(schema.$ref, documentRoot) as T)
    : schema;
}
