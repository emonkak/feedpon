import type { GetReference, TryParseSchema } from './jsonSchema.ts';
import type {
  Content,
  Definition,
  MediaType,
  Method,
  Operation,
  Parameter,
  Path,
  Reference,
  RequestBody,
  Response,
  Responses,
  StatusCode,
  SuccessfulCode,
} from './openAPI.ts';

export class Client<const TDefinition extends Definition> {
  readonly #definition: TDefinition;

  constructor(definition: TDefinition) {
    this.#definition = definition;
  }

  async request<
    const TPath extends keyof TDefinition['paths'],
    const TMethod extends keyof TDefinition['paths'][TPath],
  >(
    request: MakeRequest<TDefinition, TPath, TMethod>,
  ): Promise<MakeResponse<TDefinition, TPath, TMethod, SuccessfulCode>> {
    const path: Path = this.#definition.paths![request.path as string]!;
    const operation: Operation = path[request.method as Method]!;

    const response = await fetch(request.path as string);
    const content = await response.json();

    return content as any;
  }
}

type MakeRequest<
  T extends Definition,
  TPath extends keyof T['paths'],
  TMethod extends keyof T['paths'][TPath],
> = {
  method: TMethod;
  path: TPath;
} & MakeRequestOptions<GetOperation<T, TPath, TMethod>, Pick<T, 'components'>>;

type MakeRequestOptions<T extends Operation, TReferences> = (T extends Required<
  Pick<Operation, 'parameters'>
>
  ? MakeRequestParameters<T['parameters'], TReferences>
  : {}) &
  (T extends Required<Pick<Operation, 'requestBody'>>
    ? MakeRequestBody<
        ResolveReference<T['requestBody'], RequestBody, TReferences>,
        TReferences
      >
    : {});

type MakeRequestParameters<
  T extends (Parameter | Reference)[],
  TReferences,
> = SetRequired<
  {
    parameters: ParseParameters<
      {
        [K in keyof T]: ResolveReference<T[K], Parameter, TReferences>;
      },
      TReferences
    >;
  },
  IsRequired<T[number]>
>;

type MakeRequestBody<T extends RequestBody, TReferences> = SetRequired<
  { body: ParseContent<T['content'], TReferences> },
  IsRequired<T>
>;

type MakeResponse<
  T extends Definition,
  TPath extends keyof T['paths'],
  TMethod extends keyof T['paths'][TPath],
  TStatusCode extends StatusCode,
> = MakeResponseContent<
  GetResponse<T, TPath, TMethod, TStatusCode>,
  Pick<T, 'components'>
>;

type MakeResponseContent<
  T extends Response | Reference,
  TReferences,
> = ParseContent<
  OrElse<ResolveReference<T, Response, TReferences>['content'], {}>,
  TReferences
>['payload'];

type ParseParameters<T extends Parameter[], TReferences> = T extends [
  infer Head extends Parameter,
  ...infer Tail extends Parameter[],
]
  ? SetRequired<
      {
        [K in Head['name']]: TryParseSchema<Head['schema'], TReferences>;
      },
      IsRequired<Head>
    > &
      ParseParameters<Tail, TReferences>
  : {};

type ParseContent<T extends Content, TReferences> = {
  [K in keyof T]: {
    type: K;
    payload: TryParseSchema<
      ResolveReference<T[K], MediaType, TReferences>['schema'],
      TReferences
    >;
  };
}[keyof T];

type ResolveReference<
  T extends TExpected | Reference,
  TExpected,
  TReferences,
> = T extends Reference
  ? Extract<GetReference<T['$ref'], TReferences>, TExpected>
  : T;

type GetOperation<
  TDefinition extends Definition,
  TPath extends keyof TDefinition['paths'],
  TMethod extends keyof TDefinition['paths'][TPath],
> = TDefinition['paths'][TPath][TMethod] extends Operation
  ? TDefinition['paths'][TPath][TMethod]
  : never;

type GetResponse<
  TDefinition extends Definition,
  TPath extends keyof TDefinition['paths'],
  TMethod extends keyof TDefinition['paths'][TPath],
  TStatusCode extends StatusCode,
> = TDefinition['paths'][TPath][TMethod] extends Operation & {
  responses: Responses;
}
  ? {
      [K in TStatusCode]: OrElse<
        TDefinition['paths'][TPath][TMethod]['responses'][K],
        never
      >;
    }[TStatusCode]
  : never;

type IsRequired<T> = T extends { required: true } ? true : false;

type SetRequired<T, TRequired extends boolean> = TRequired extends true
  ? Required<T>
  : Partial<T>;

type OrElse<T, U> = T extends {} ? T : U;
