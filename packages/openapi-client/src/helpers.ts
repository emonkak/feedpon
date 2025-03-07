export type AllOf<T extends any[]> = T extends []
  ? {}
  : T extends [infer Head, ...infer Tail]
    ? Head & AllOf<Tail>
    : never;

export type AnyOf<T extends any[]> = {
  [K in keyof T]: T[K];
}[number];

export type Filter<T extends any[], TConstraint> = T extends [
  infer Head,
  ...infer Tail,
]
  ? [Head] extends [TConstraint]
    ? [Head, ...Filter<Tail, TConstraint>]
    : Filter<Tail, TConstraint>
  : [];

export type Get<T, TPath extends string[]> = TPath extends [
  infer Head extends keyof T,
  ...infer Tail extends string[],
]
  ? Get<T[Head], Tail>
  : T;

export type Only<T, K extends keyof T> = {
  [L in K]: Required<Pick<T, L>>;
}[K];

export type OrElse<T, U> = T extends {} ? T : U;

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type Split<
  T extends string,
  TSeparator extends string,
> = T extends `${infer Head}${TSeparator}${infer Tail}`
  ? [Head, ...Split<Tail, TSeparator>]
  : T extends ''
    ? []
    : [T];
