import React from 'react';

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as React.MutableRefObject<T>).current = value;
  }
}

function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T) => {
    for (const ref of refs) {
      setRef(ref, node);
    }
  };
}

export function useComposedRefs<T>(...refs: PossibleRef<T>[]) {
  return React.useCallback(composeRefs(...refs), refs);
}
