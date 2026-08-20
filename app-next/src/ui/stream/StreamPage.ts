import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { updateSession } from '../../state/actions.ts';
import { AppStore, type Session } from '../../state/store.ts';
import { StackScroller } from '../primitives/StackScroller.ts';
import { StreamItem } from './StreamItem.ts';
import { StreamNav } from './StreamNav.ts';

export interface StreamPageProps {
  stream: Stream;
  session: Session;
}

export const StreamPage = createComponent(function StreamPage({
  stream,
  session: initialSession,
}: StreamPageProps) {
  const store = this.inject(AppStore);
  const [session, setSession] = this.useState(initialSession);

  const handleIndexChange = (index: number) => {
    const newSession = { ...session, index };
    store.dispatch(updateSession(newSession));
    setSession(newSession);
  };

  const scroller = StackScroller({
    elementSelector: (entry) => StreamItem({ entry }),
    initialIndex: session?.index,
    keySelector: (entry) => entry.id,
    onIndexChange: handleIndexChange,
    source: stream.items,
  }).withKey(stream.id);

  return html`
    <div class="StreamPage">
      <header class="StreamPage-Header">
        <${StreamNav({ session, stream })}>
      </header>
      <div class="StreamPage-Content">
        <${scroller}>
      </div>
    </div>
  `;
});
