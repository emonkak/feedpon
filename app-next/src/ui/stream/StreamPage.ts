import type { Stream } from '@feedpon/feedly-client';
import { createComponent, html } from 'barebind';
import { changeIndex } from '../../state/actions.ts';
import { AppStore } from '../../state/store.ts';
import { StackScroller } from '../primitives/StackScroller.ts';
import { StreamItem } from './StreamItem.ts';
import { StreamNav } from './StreamNav.ts';

export interface StreamPageProps {
  stream: Stream;
}

export const StreamPage = createComponent(function StreamPage({
  stream,
}: StreamPageProps) {
  const store = this.inject(AppStore);
  const session = store.state$.get('session').value;

  const handleIndexChange = (index: number) => {
    store.dispatch(changeIndex(stream.id, index));
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
        <${StreamNav({ stream })}>
      </header>
      <div class="StreamPage-Content">
        <${scroller}>
      </div>
    </div>
  `;
});
