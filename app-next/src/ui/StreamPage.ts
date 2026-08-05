import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { EmbeddedHTML } from './primitives/EmbeddedHTML.ts';

export interface StreamPageProps {
  stream: Stream;
}

export const StreamPage = createComponent<StreamPageProps>(function StreamPage({
  stream,
}) {
  const items = stream.items.map(
    (item) => html`
      <li class="EntryList-Item">
        <article class="Entry" lang=${item.language}>
          <details>
            <summary>
              <h1>${item.title}</h1>
            </summary>
            <${EmbeddedHTML({
              additionalAttributes: { class: 'Entry-content' },
              html: item.content?.content ?? item.summary?.content ?? '',
              origin: item.origin.htmlUrl,
            })}>
          </details>
        </article>
      </li>
    `,
  );
  return html`
    <h1>${stream.title}</h1>
    <ol class="EntryList">
      <${items}>
    </ol>
  `;
});
