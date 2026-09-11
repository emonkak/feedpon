import type { Entry } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { EmbeddedHTML } from '../primitives/embedded-html.ts';
import { ArticleHeader } from './article-header.ts';
import { StackedArticleNav } from './stacked-article-nav.ts';

export interface StreamItemProps {
  entry: Entry;
}

export const StackedArticleView = createComponent(function StackedArticleView({
  entry,
}: StreamItemProps) {
  const numberFormat = this.inject(Intl.NumberFormat);

  return html`
    <article class="StackedArticleView" lang=${entry.language} dir=${(entry.content ?? entry.summary)?.direction}>
      <header class="StackedArticleView-Header">
        <${ArticleHeader({ entry, numberFormat })}>
      </header>
      <div
        class="StackedArticleView-Content"
        dir=${(entry.content ?? entry.summary)?.direction}
      >
        <${EmbeddedHTML({
          html: (entry.content ?? entry.summary)?.content ?? '',
          origin: entry.origin.htmlUrl,
        })}>
      </div>
      <footer class="StackedArticleView-Footer">
        <${StackedArticleNav({})}>
      </footer>
    </article>
  `;
});
