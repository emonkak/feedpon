export type JSONPointerURL = `#` | `#/${string}`;

export type ResolveJSONPointerURL<
  TRef extends string,
  TScope,
> = TRef extends '#'
  ? TScope
  : TRef extends `#/${infer Path}`
    ? FollowPath<TScope, UnescapeJSONPointerPath<Split<Path, '/'>>>
    : never;

type FollowPath<T, TPath extends string[]> = TPath extends [
  infer Head extends keyof T,
  ...infer Tail extends string[],
]
  ? FollowPath<T[Head], Tail>
  : T;

type Split<
  T extends string,
  TSeparator extends string,
> = T extends `${infer Head}${TSeparator}${infer Tail}`
  ? [Head, ...Split<Tail, TSeparator>]
  : T extends ''
    ? []
    : [T];

type UnescapeJSONPointerComponent<T extends string> =
  T extends `${infer Head}~${infer N extends number}${infer Tail}`
    ? `${Head}${UnescapeJSONPointerToken<`~${N}`>}${UnescapeJSONPointerComponent<Tail>}`
    : T;

type UnescapeJSONPointerPath<T extends string[]> = {
  [K in keyof T]: UnescapeJSONPointerComponent<T[K]>;
};

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
  url: JSONPointerURL,
  value: any,
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
