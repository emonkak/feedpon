import type {
  ContentType,
  MediaType,
  Parameter,
  ParameterLocation,
  ParameterStyle,
} from './types.ts';

export type ContentSerializer = (
  value: unknown,
  type: ContentType,
  mediaType: MediaType,
) => BodyInit;

export type ParameterSerializer = (
  value: unknown,
  parameter: Parameter,
) => string;

const DEFAULT_STYLES: Record<ParameterLocation, ParameterStyle> = {
  query: 'form',
  path: 'simple',
  header: 'simple',
  cookie: 'form',
};

const PREFIXES: Record<ParameterStyle, string> = {
  matrix: ';',
  label: '.',
  simple: '',
  form: '?',
  spaceDelimited: '?',
  pipeDelimited: '?',
  deepObject: '?',
};

const DELIMITERS: Record<ParameterStyle, string> = {
  matrix: ';',
  label: '.',
  simple: ',',
  form: '&',
  spaceDelimited: '%20', // " "
  pipeDelimited: '%7C', // "|"
  deepObject: '&',
};

const EXCEPT_RFC3986_UNRESERVED_CHARACTER_PATTERN = /[^0-9A-Za-z\-._~]/g;
const EXCEPT_RFC3986_CHARACTER_PATTERN = /[^0-9A-Za-z\-._~:/?#[\]@!$&'()*+,;]/g;

export const defaultContentSerializer: ContentSerializer = (
  value: unknown,
  contentType: ContentType,
) => {
  switch (contentType) {
    case 'application/json':
      return JSON.stringify(value);
    case 'application/x-www-form-urlencoded':
      return '?' + new URLSearchParams(value as any);
    case 'multipart/form-data': {
      const formData = new FormData();
      for (const key in value as any) {
        formData.append(key, (value as any)[key]);
      }
      return formData;
    }
  }
  if (
    value instanceof ArrayBuffer ||
    value instanceof Blob ||
    value instanceof DataView ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    typeof value === 'string'
  ) {
    return value;
  }
  throw new Error('A value that cannot be serialized was given.');
};

export const defaultParameterSerializer: ParameterSerializer = (
  value: unknown,
  parameter: Parameter,
) => {
  if (value == null) {
    return parameter.allowEmptyValue ? serializeNullable(parameter) : '';
  } else if (typeof value === 'object') {
    return Array.isArray(value)
      ? serializeArray(value, parameter)
      : serializeObject(value as Record<string, unknown>, parameter);
  } else {
    return serializePrimitive(value, parameter);
  }
};

export function serializeNullable(parameter: Parameter): string {
  const {
    name,
    style = DEFAULT_STYLES[parameter.in] ?? 'simple',
    allowReserved = false,
  } = parameter;
  const prefix = PREFIXES[style];
  const encode = allowReserved ? encodeLoosely : encodeStrictly;

  switch (style) {
    case 'matrix':
      return prefix + encode(name);
    case 'form':
      return prefix + encode(name) + '=';
    default:
      return prefix;
  }
}

export function serializePrimitive(value: {}, parameter: Parameter): string {
  const {
    name,
    style = DEFAULT_STYLES[parameter.in] ?? 'simple',
    allowReserved = false,
  } = parameter;
  const prefix = PREFIXES[style];
  const encode = allowReserved ? encodeLoosely : encodeStrictly;

  switch (style) {
    case 'matrix':
    case 'form':
      return prefix + encode(name) + '=' + encode(String(value));
    case 'label':
    case 'simple':
    default:
      return prefix + encode(String(value));
  }
}

export function serializeArray(
  values: unknown[],
  parameter: Parameter,
): string {
  const {
    name,
    style = DEFAULT_STYLES[parameter.in] ?? 'simple',
    explode = style === 'form' ? true : false,
    allowReserved = false,
  } = parameter;
  const prefix = PREFIXES[style];
  const encode = allowReserved ? encodeLoosely : encodeStrictly;

  switch (style) {
    case 'matrix':
    case 'form': {
      return (
        prefix +
        (explode
          ? values
              .map((value) => encode(name) + '=' + encode(String(value)))
              .join(DELIMITERS[style])
          : encode(name) +
            '=' +
            values.map((value) => encode(String(value))).join(','))
      );
    }
    case 'spaceDelimited':
    case 'pipeDelimited':
      return (
        prefix +
        encode(name) +
        '=' +
        values.map((value) => encode(String(value))).join(DELIMITERS[style])
      );
    default: {
      const delimiter = explode ? DELIMITERS[style] : ',';
      return (
        prefix + values.map((value) => encode(String(value))).join(delimiter)
      );
    }
  }
}

export function serializeObject(
  value: Record<string, unknown>,
  parameter: Parameter,
): string {
  const {
    name,
    style = DEFAULT_STYLES[parameter.in] ?? 'simple',
    explode = style === 'form' ? true : false,
    allowReserved = false,
  } = parameter;
  const prefix = PREFIXES[style];
  const encode = allowReserved ? encodeLoosely : encodeStrictly;
  const entries = Object.entries(value);

  switch (style) {
    case 'matrix':
    case 'form':
      return (
        prefix +
        (explode
          ? entries
              .map(([key, value]) => encode(key) + '=' + encode(String(value)))
              .join(DELIMITERS[style])
          : encode(name) +
            '=' +
            entries
              .map(([key, value]) => encode(key) + ',' + encode(String(value)))
              .join(','))
      );
    case 'spaceDelimited':
    case 'pipeDelimited': {
      const delimiter = DELIMITERS[style];
      return (
        prefix +
        encode(name) +
        '=' +
        entries
          .map(
            ([key, value]) => encode(key) + delimiter + encode(String(value)),
          )
          .join(delimiter)
      );
    }
    case 'deepObject':
      return (
        prefix +
        entries
          .map(
            ([key, value]) =>
              encode(name + '[' + key + ']') + '=' + encode(String(value)),
          )
          .join(DELIMITERS[style])
      );
    default:
      return (
        prefix +
        (explode
          ? entries
              .map(([key, value]) => encode(key) + '=' + encode(String(value)))
              .join(DELIMITERS[style])
          : entries
              .map(([key, value]) => encode(key) + ',' + encode(String(value)))
              .join(','))
      );
  }
}

function encodeLoosely(uri: string): string {
  return uri.replace(EXCEPT_RFC3986_CHARACTER_PATTERN, percentEncode);
}

function encodeStrictly(uri: string): string {
  return uri.replace(
    EXCEPT_RFC3986_UNRESERVED_CHARACTER_PATTERN,
    percentEncode,
  );
}

function percentEncode(c: string): string {
  return '%' + c.charCodeAt(0).toString(16).toUpperCase();
}
