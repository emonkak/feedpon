import type { Schema } from './jsonSchema.ts';

export interface Definition {
  openapi: `3` | `3.${number}` | `3.${number}.${number}`;
  paths?: Record<string, Path>;
  components?: Components;
}

export type Path = Partial<Record<Method, Operation>>;

export interface Components {
  schemas?: Record<string, Schema>;
  responses?: Record<string, Response>;
  parameters?: Record<string, Parameter>;
  examples?: Record<string, Example>;
  requestBodies?: Record<string, RequestBody>;
  headers?: Record<string, Header>;
}

export type Method =
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'options'
  | 'head'
  | 'patch'
  | 'trace';

export interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses?: Responses;
}

export interface ExternalDocumentation {
  description?: string;
  url: string;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?:
    | 'matrix'
    | 'label'
    | 'simple'
    | 'form'
    | 'spaceDelimited'
    | 'pipeDelimited'
    | 'deepObject';
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Schema;
  example?: any;
  examples?: Record<string, Example | Reference>;
  content?: Content;
}

export interface RequestBody {
  description?: string;
  content: Content;
  required?: boolean;
}

export type Responses = Partial<Record<StatusCode, Response | Reference>>;

export interface Response {
  description: string;
  headers?: Record<string, Header | Reference>;
  content?: Content;
  required?: boolean;
}

export type Content = Record<string, MediaType | Reference>;

export type Header = Omit<Parameter, 'name' | 'in'>;

export interface MediaType {
  schema?: Schema;
  example?: any;
  examples?: Record<string, Example | Reference>;
  encoding?: Record<string, Encoding>;
}

export interface Example {
  summary?: string;
  description?: string;
  value: any;
  externalValue?: string;
}

export interface Encoding {
  contentType?: string;
  headers?: Record<string, Header | Reference>;
}

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type InformationalCode = `1${Digit}${Digit | 'X'}` | `1XX`;
export type SuccessfulCode = `2${Digit}${Digit | 'X'}` | `2XX`;
export type RedirectionCode = `3${Digit}${Digit | 'X'}` | `3XX`;
export type ClientErrorCode = `4${Digit}${Digit | 'X'}` | `4XX`;
export type ServerErrorCode = `5${Digit}${Digit | 'X'}` | `5XX`;

export type StatusCode =
  | InformationalCode
  | SuccessfulCode
  | RedirectionCode
  | ClientErrorCode
  | ServerErrorCode
  | 'default';

export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}
