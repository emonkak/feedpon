import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { AppStore } from '../../state/store.ts';

export interface StreamNavProps {
  stream: Stream;
}

export const StreamNav = createComponent(function StreamNav({
  stream,
}: StreamNavProps) {
  const store = this.inject(AppStore);
  const session = this.use(store.state$.get('session'));
  const item = session !== null ? stream.items[session.index] : undefined;

  return html`
    <nav class="StreamNav">
      <h1 class="StreamNav-title">${item?.origin.title ?? stream.title}</h1>
      <h2 class="StreamNav-subtitle">${item?.title}</h2>
    </nav>
  `;
});
