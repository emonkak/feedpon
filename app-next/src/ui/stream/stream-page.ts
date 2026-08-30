import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { updateScrollIndex } from '../../state/actions.ts';
import { AppStore, type Session } from '../../state/store.ts';
import { StackScroller } from '../primitives/stack-scroller.ts';
import { StreamItem } from './stream-item.ts';
import { StreamNav } from './stream-nav.ts';

export interface StreamPageProps {
  session: Session;
  stream: Stream;
}

export const StreamPage = createComponent(function StreamPage({
  session: initialSession,
  stream: initialStream,
}: StreamPageProps) {
  const store = this.inject(AppStore);
  const session$ = store.state$
    .get('session')
    .scan(
      (prevSession, nextSession) =>
        nextSession?.id === prevSession.id ? nextSession : prevSession,
      initialSession,
    );
  const session = this.use(session$);
  const [stream, _setStream] = this.useState(initialStream);

  const handleIndexChange = (index: number) => {
    store.dispatch(updateScrollIndex(stream.id, index));
  };

  const nav = StreamNav({ session, stream });
  const scroller = StackScroller({
    elementSelector: (entry) => StreamItem({ entry }),
    initialIndex: session.scrollIndex,
    keySelector: (entry) => entry.id,
    onIndexChange: handleIndexChange,
    source: stream.items,
  }).withKey(stream.id);

  return html`
    <div class="StreamPage">
      <header class="StreamPage-Header">
        <${nav}>
      </header>
      <div class="StreamPage-Main">
        <${scroller}>
      </div>
    </div>
  `;
});
