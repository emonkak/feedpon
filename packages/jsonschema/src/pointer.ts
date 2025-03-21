export type JSONPointerURL = `#` | `#/${string}`;

export type UnescapeJSONPointerComponent<T extends string> =
  T extends `${infer Head}~${infer N extends number}${infer Tail}`
    ? `${Head}${UnescapeJSONPointerToken<`~${N}`>}${UnescapeJSONPointerComponent<Tail>}`
    : T;

type UnescapeJSONPointerToken<T extends string> = T extends '~0'
  ? '~'
  : T extends '~1'
    ? '/'
    : T;

const JSON_POINTER_ESCAPED_TOKEN_REGEXP = /~[0-1]/g;
const JSON_POINTER_ESCAPED_TOKENS = {
  '~0': '~',
  '~1': '/',
};
const JSON_POINTER_UNESCAPED_CHARACTER_REGEXP = /[~/]/g;
const JSON_POINTER_UNESCAPED_CHARACTERS = {
  '~': '~0',
  '/': '~1',
};

const JSON_POINTER_URL_REGEXP = /^#(?:\/|$)/;

export function escapeJSONPointerComponent(component: string): string {
  return component.replaceAll(
    JSON_POINTER_UNESCAPED_CHARACTER_REGEXP,
    (character) =>
      JSON_POINTER_UNESCAPED_CHARACTERS[
        character as keyof typeof JSON_POINTER_UNESCAPED_CHARACTERS
      ],
  );
}

export function isJSONPointerURL(s: string): s is JSONPointerURL {
  return JSON_POINTER_URL_REGEXP.test(s);
}

export function resolveJSONPointerURL(
  value: any,
  url: JSONPointerURL,
): unknown {
  if (url === '#') {
    return value;
  }

  const components = decodeURIComponent(url).slice(2).split('/');
  let reference = value;

  for (let i = 0, l = components.length; i < l; i++) {
    const key = unescapeJSONPointerComponent(components[i]!);
    if (!Object.hasOwn(reference, key) || reference[key] == null) {
      return null;
    }
    reference = reference[key];
  }

  return reference;
}

export function unescapeJSONPointerComponent(component: string): string {
  return component.replaceAll(
    JSON_POINTER_ESCAPED_TOKEN_REGEXP,
    (token) =>
      JSON_POINTER_ESCAPED_TOKENS[
        token as keyof typeof JSON_POINTER_ESCAPED_TOKENS
      ],
  );
}
