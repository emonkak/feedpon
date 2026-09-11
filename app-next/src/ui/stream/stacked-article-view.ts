import type { Entry, Link } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { decodeHTMLEntities } from '../../foundation/decode-html-entities.ts';
import { EmbeddedHTML } from '../primitives/embedded-html.ts';
import { StackedArticleNav } from './stacked-article-nav.ts';

export interface StreamItemProps {
  entry: Entry;
}

export const StackedArticleView = createComponent(function StackedArticleView({
  entry,
}: StreamItemProps) {
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
            ${decodeHTMLEntities(entry.title ?? '')}
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
