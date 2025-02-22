export type Comparer<T> = (v1: T, v2: T) => number;

export function composeComparers<TValue>(
  comparer: Comparer<TValue>,
  ...restComparers: Comparer<TValue>[]
): (v1: TValue, v2: TValue) => number {
  return restComparers.reduce(
    (composedComparer, nextComparer) => (v1, v2) => {
      const ordering = composedComparer(v1, v2);
      return ordering !== 0 ? ordering : nextComparer(v1, v2);
    },
    comparer,
  );
}

export function orderByAscending<TValue, TKey>(
  keySelector: (v: TValue) => TKey,
): Comparer<TValue> {
  return (v1, v2) => {
    const k1 = keySelector(v1);
    const k2 = keySelector(v2);
    return k1 < k2 ? -1 : k1 > k2 ? 1 : 0;
  };
}

export function orderByDescending<TValue, TKey>(
  keySelector: (v: TValue) => TKey,
): Comparer<TValue> {
  return (v1, v2) => {
    const k1 = keySelector(v1);
    const k2 = keySelector(v2);
    return k1 < k2 ? 1 : k1 > k2 ? -1 : 0;
  };
}
