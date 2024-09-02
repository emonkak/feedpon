import React, { useLayoutEffect, useRef } from 'react';

import cleanNode from 'feedpon-utils/cleanNode';
import walkNode from 'feedpon-utils/walkNode';

interface SandboxProps {
  className?: string;
  baseUrl: string;
  html: string;
}

export default function Sandbox({ className, baseUrl, html }: SandboxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const wrapper = document.createElement('div');

    if (html !== '') {
      wrapper.insertAdjacentHTML('beforeend', html);
      walkNode(wrapper, (child) => cleanNode(child, baseUrl));
    }

    const container = containerRef.current!;

    let child: ChildNode | null;

    while ((child = container.firstChild)) {
      container.removeChild(child);
    }

    while ((child = wrapper.firstChild)) {
      container.appendChild(child);
    }
  }, [baseUrl, html]);

  return <div ref={containerRef} className={className} />;
}
