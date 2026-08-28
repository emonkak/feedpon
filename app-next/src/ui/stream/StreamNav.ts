import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import type { Session } from '../../state/store.ts';
import { CircleProgress } from '../primitives/CirlceProgress.ts';

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
      <div class="StreamNav-Side use-only-small">
        <button type="button" class="StreamNav-Button">
          <div class="StreamNav-Button-icon PathIcon shape menu"></div>
        </button>
      </div>
      <div class="StreamNav-Content">
        <h1 class="StreamNav-feedTitle use-ellipsis">${item?.origin.title ?? stream.title}</h1>
        <h2 class="StreamNav-articleTitle use-ellipsis">${item?.title}</h2>
      </div>
      <div class="StreamNav-Side">
        <button type="button" class="StreamNav-Button">
          <div class="StreamNav-Button-icon">
            <${CircleProgress({
              label: (session.index + 1).toString().slice(-3),
              progress: (session.index + 1) / stream.items.length,
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
