import type { Schema } from './schema.ts';

export interface Description {
  openapi: `3` | `3.${number}` | `3.${number}.${number}`;
  paths: Record<string, Path>;
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
  in: ParameterLocation;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  schema?: Schema;
  example?: any;
  examples?: Record<string, Example | Reference>;
  content?: Content;
}

export type ParameterLocation = 'query' | 'header' | 'path' | 'cookie';

export type ParameterStyle =
  | 'matrix'
  | 'label'
  | 'simple'
  | 'form'
  | 'spaceDelimited'
  | 'pipeDelimited'
  | 'deepObject';

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
}

export type Content = Record<ContentType, MediaType | Reference>;

export type ContentType = `${string}/${string}`;

export type Header = Omit<
  Parameter,
  'name' | 'in' | 'style' | 'allowEmptyValue' | 'allowReserved'
>;

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

export type StatusCode = `${number}` | `${1 | 2 | 3 | 4 | 5}XX` | 'default';

export interface Reference {
  $ref: string;
  summary?: string;
  description?: string;
}
