import type { Entry, Link } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { EmbeddedHTML } from '../primitives/EmbeddedHTML.ts';

export interface EntryViewProps {
  entry: Entry;
}

export const EntryView = createComponent(function EntryView({
  entry,
}: EntryViewProps) {
  return html`
    <article class="Entry" lang=${entry.language}>
      <header>
        <h1>
          <a href=${entry.canonicalUrl ?? getAlternate(entry, 'text/html')?.href} target="_blank">
            ${entry.title}
          </a>
        </h1>
      </header>
      <${EmbeddedHTML({
        additionalAttributes: {
          class: 'Entry-content',
          dir: entry.content?.direction ?? entry.summary?.direction,
        },
        html: entry.content?.content ?? entry.summary?.content ?? '',
        origin: entry.origin.htmlUrl,
      })}>
    </article>
  `;
});

function getAlternate(entry: Entry, type: string): Link | undefined {
  return entry.alternate?.find((link) => link.type === type);
}
