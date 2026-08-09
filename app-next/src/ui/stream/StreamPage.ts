import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { StackScroller } from '../primitives/StackScroller.ts';
import { EntryView } from './EntryView.ts';

export interface StreamPageProps {
  stream: Stream;
}

export const StreamPage = createComponent(function StreamPage({
  stream,
}: StreamPageProps) {
  const scroller = StackScroller({
    elementSelector: (entry) => EntryView({ entry }),
    keySelector: (entry) => entry.id,
    source: stream.items,
  }).withKey(stream.id);
  return html`
    <div class="StreamPage">
      <header class="StreamPage-Header">
        <h1 class="StreamPage-Header-heading">${stream.title}</h1>
      </header>
      <div class="StreamPage-Content">
        <${scroller}>
      </div>
    </div>
  `;
});
