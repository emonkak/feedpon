import { createComponent, type RenderContext } from 'barebind';
import cleanNode from 'feedpon-utils/cleanNode.ts';
import walkNode from 'feedpon-utils/walkNode.ts';

interface EmbeddedHTMLProps {
  class?: string;
  baseUrl: string;
  html: string;
}

export const EmbeddedHTML = createComponent(function EmbeddedHTML(
  { class: className, baseUrl, html }: EmbeddedHTMLProps,
  $: RenderContext,
): unknown {
  const containerRef = $.useRef<Element | null>(null);

  $.useLayoutEffect(() => {
    const template = document.createElement('template');

    if (html !== '') {
      template.innerHTML = html;
      walkNode(template.content, (child) => cleanNode(child, baseUrl));
    }

    containerRef.current?.replaceChildren(template.content);
  }, [baseUrl, html]);

  return $.html`<div :ref=${containerRef} class=${className}></div>`;
});
