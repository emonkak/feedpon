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
      <div class="StreamNav-Section left u-small-only">
        <button type="button" class="Button ghost default">
          <div class="PathIcon shape toggle-sidebar"></div>
        </button>
      </div>
      <div class="StreamNav-Section center">
        <h1 class="StreamNav-title">${item?.origin.title ?? stream.title}</h1>
        <h2 class="StreamNav-subtitle">${item?.title}</h2>
      </div>
      <div class="StreamNav-Section right">
        <button type="button" class="Button ghost default">
          <div class="PathIcon solid vertical-dot"></div>
        </button>
      </div>
    </nav>
  `;
});
