import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { ref } from '@emonkak/ebit/directives.js';

import cleanNode from 'feedpon-utils/cleanNode';
import walkNode from 'feedpon-utils/walkNode';

interface EmbeddedHTMLProps {
  class?: string;
  baseUrl: string;
  html: string;
}

export function EmbeddedHTML(
  { class: className, baseUrl, html }: EmbeddedHTMLProps,
  context: RenderContext,
): TemplateResult {
  const containerRef = context.useRef<Element | null>(null);

  context.useLayoutEffect(() => {
    const template = document.createElement('template');

    if (html !== '') {
      template.innerHTML = html;
      walkNode(template.content, (child) => cleanNode(child, baseUrl));
    }

    containerRef.current?.replaceChildren(template.content);
  }, [baseUrl, html]);

  return context.html`<div ref=${ref(containerRef)} class=${className}></div>`;
}
