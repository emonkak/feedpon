import type { Entry, Link } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { EmbeddedHTML } from '../primitives/EmbeddedHTML.ts';

export interface StreamItemProps {
  entry: Entry;
}

export const StreamItem = createComponent(function StreamItem({
  entry,
}: StreamItemProps) {
  return html`
    <article class="StreamItem" lang=${entry.language}>
      <header>
        <h1>
          <a
            href=${entry.canonicalUrl ?? getAlternate(entry, 'text/html')?.href}
            target="_blank"
          >
            ${entry.title}
          </a>
        </h1>
      </header>
      <div
        class="StreamItem-Content"
        dir=${(entry.content ?? entry.summary)?.direction}
      >
        <${EmbeddedHTML({
          html: (entry.content ?? entry.summary)?.content ?? '',
          origin: entry.origin.htmlUrl,
        })}>
      </div>
    </article>
  `;
});

function getAlternate(entry: Entry, type: string): Link | undefined {
  return entry.alternate?.find((link) => link.type === type);
}
