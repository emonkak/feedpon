import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { EntryView } from './EntryView.ts';

export interface StreamPageProps {
  stream: Stream;
}

export const StreamPage = createComponent(function StreamPage({
  stream,
}: StreamPageProps) {
  const entries = stream.items.map(
    (entry) => html`
      <li class="EntryList-Item">
        <${EntryView({ entry })}>
      </li>
    `,
  );
  return html`
    <div class="StreamPage">
      <header class="StreamPage-Header">
        <h1 class="StreamPage-Header-heading">${stream.title}</h1>
      </header>
      <div class="StreamPage-Content">
        <ol class="EntryList">
          <${entries}>
        </ol>
      </div>
    </div>
  `;
});
