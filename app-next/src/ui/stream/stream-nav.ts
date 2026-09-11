import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { decodeHTMLEntities } from '../../foundation/decode-html-entities.ts';
import type { Session } from '../../state/store.ts';
import { CircleProgress } from '../primitives/cirlce-progress.ts';

export interface StreamNavProps {
  session: Session;
  stream: Stream;
}

export const StreamNav = createComponent(function StreamNav({
  session,
  stream,
}: StreamNavProps) {
  const { scrollIndex } = session;
  const item = stream.items[scrollIndex];

  return html`
    <nav class="StreamNav">
      <div class="StreamNav-Side use-only-small">
        <button type="button" class="StreamNav-Button">
          <div class="StreamNav-Button-icon PathIcon shape menu"></div>
        </button>
      </div>
      <div class="StreamNav-Content" lang=${item?.language}>
        <h1 class="StreamNav-title use-ellipsis">${decodeHTMLEntities(item?.title ?? '')}</h1>
        <div class="StreamNav-origin use-ellipsis" >${decodeHTMLEntities(item?.origin.title ?? '')}</div>
      </div>
      <div class="StreamNav-Side">
        <button type="button" class="StreamNav-Button">
          <div class="StreamNav-Button-icon">
            <${CircleProgress({
              label: (scrollIndex + 1).toString().slice(-3),
              progress: (scrollIndex + 1) / stream.items.length,
            })}>
          </div>
        </button>
        <button type="button" class="StreamNav-Button">
          <div class="StreamNav-Button-icon PathIcon solid vertical-dots"></div>
        </button>
      </div>
    </nav>
  `;
});
