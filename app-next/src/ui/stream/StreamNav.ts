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
      <div class="StreamNav-Left use-only-small">
        <button type="button" class="Button flat default">
          <div class="PathIcon shape menu slot-icon"></div>
        </button>
      </div>
      <div class="StreamNav-Middle">
        <h1 class="StreamNav-title">${item?.origin.title ?? stream.title}</h1>
        <h2 class="StreamNav-subtitle">${item?.title}</h2>
      </div>
      <div class="StreamNav-Right">
        <button type="button" class="Button flat default">
          <div class="PathIcon solid vertical-dots slot-icon"></div>
        </button>
      </div>
    </nav>
  `;
});
