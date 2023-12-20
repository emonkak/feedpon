import React, { cloneElement, forwardRef, useEffect, useRef } from 'react';

import useComposedRefs from '../hooks/useComposedRefs';
import useEvent from '../hooks/useEvent';

interface DismissibleProps {
  children: React.ReactElement<any>;
  isDisabled: boolean;
  onDismiss?: () => void;
}

export default forwardRef(Dismissible);

function Dismissible(
  { children, isDisabled = false, onDismiss }: DismissibleProps,
  forwaredRef: React.ForwardedRef<unknown>,
) {
  const containerRef = useRef<Node | null>(null);
  const composedRef = useComposedRefs(forwaredRef, (node: Node) => {
    containerRef.current = node;
  });

  const documentClickHandler = useEvent((event: MouseEvent) => {
    if (isDisabled) {
      return;
    }

    const container = containerRef.current;
    const target = event.target as HTMLElement;

    if (!container?.contains(target) && target.offsetParent !== null) {
      onDismiss?.();
    }
  });

  const documentKeydownHandler = useEvent((event: KeyboardEvent) => {
    if (isDisabled) {
      return;
    }

    if (event.key === 'Escape') {
      onDismiss?.();
    }
  });

  useEffect(() => {
    document.addEventListener('click', documentClickHandler);
    document.addEventListener('keydown', documentKeydownHandler);

    return () => {
      document.removeEventListener('click', documentClickHandler);
      document.removeEventListener('keydown', documentKeydownHandler);
    };
  }, []);

  return cloneElement(children, {
    ref: composedRef,
  });
}
