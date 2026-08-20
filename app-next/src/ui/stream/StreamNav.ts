import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import type { Session } from '../../state/store.ts';

export interface StreamNavProps {
  stream: Stream;
  session: Session;
}

export const StreamNav = createComponent(function StreamNav({
  stream,
  session,
}: StreamNavProps) {
  const item = stream.items[session.index];

  return html`
    <nav class="StreamNav">
      <h1 class="StreamNav-title">${item?.origin.title ?? stream.title}</h1>
      <h2 class="StreamNav-subtitle">${item?.title}</h2>
    </nav>
  `;
});
