import type { Entry, Link } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { EmbeddedHTML } from '../primitives/embedded-html.ts';
import { StackedArticleNav } from './stacked-article-nav.ts';

const HTNL_ENTITY_PATTERN = /&(#(?:x[0-9A-F]+|\d+)|[0-9A-Z]+)/i;

export interface StreamItemProps {
  entry: Entry;
}

export const StackedArticleView = createComponent(function StackedArticleView({
  entry,
}: StreamItemProps) {
  const title = this.useMemo(
    () =>
      entry.title !== undefined && !HTNL_ENTITY_PATTERN.test(entry.title)
        ? decodeHTMLEntities(entry.title)
        : entry.title,
    [entry.title],
  );

  return html`
    <article class="StackedArticleView" lang=${entry.language}>
      <header class="StackedArticleView-Header">
        <${StackedArticleNav({ direction: 'vertical' })}>
      </header>
      <div
        class="StackedArticleView-Content"
        dir=${(entry.content ?? entry.summary)?.direction}
      >
        <h1>
          <a
            href=${entry.canonicalUrl ?? getAlternate(entry, 'text/html')?.href}
            target="_blank"
          >
            ${title}
          </a>
        </h1>
        <${EmbeddedHTML({
          html: (entry.content ?? entry.summary)?.content ?? '',
          origin: entry.origin.htmlUrl,
        })}>
      </div>
      <footer class="StackedArticleView-Footer">
        <${StackedArticleNav({ direction: 'horizontal' })}>
      </footer>
    </article>
  `;
});

function getAlternate(entry: Entry, type: string): Link | undefined {
  return entry.alternate?.find((link) => link.type === type);
}

function decodeHTMLEntities(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content.textContent;
}
