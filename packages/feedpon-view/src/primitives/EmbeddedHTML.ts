import type { RenderContext } from 'barebind';
import cleanNode from 'feedpon-utils/cleanNode.ts';
import walkNode from 'feedpon-utils/walkNode.ts';

interface EmbeddedHTMLProps {
  class?: string;
  baseUrl: string;
  html: string;
}

export function EmbeddedHTML(
  { class: className, baseUrl, html }: EmbeddedHTMLProps,
  context: RenderContext,
): unknown {
  const containerRef = context.useRef<Element | null>(null);

  context.useLayoutEffect(() => {
    const template = document.createElement('template');

    if (html !== '') {
      template.innerHTML = html;
      walkNode(template.content, (child) => cleanNode(child, baseUrl));
    }

    containerRef.current?.replaceChildren(template.content);
  }, [baseUrl, html]);

  return context.html`<div :ref=${containerRef} class=${className}></div>`;
}
