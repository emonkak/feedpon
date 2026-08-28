import { createComponent, type HookFunction, html } from 'barebind';
import { updateScrollIndex } from '../../state/actions.ts';
import { AppStore, type Session } from '../../state/store.ts';
import { StackScroller } from '../primitives/stack-scroller.ts';
import { StreamItem } from './stream-item.ts';
import { StreamNav } from './stream-nav.ts';

export interface StreamPageProps {
  session: Session;
}

export const StreamPage = createComponent(function StreamPage({
  session: initialSession,
}: StreamPageProps) {
  const store = this.inject(AppStore);
  const session = this.use(SyncSession(store, initialSession));
  const stream = session.stream;

  const handleIndexChange = (index: number) => {
    store.dispatch(updateScrollIndex(stream.id, index));
  };

  const nav = StreamNav({ session });
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

function SyncSession(
  store: AppStore,
  initialSession: Session,
): HookFunction<Session> {
  return (context) => {
    const [session, setSession] = context.useState(initialSession);
    const session$ = store.state$.get('session');
    context.useEffect(() => {
      const refresh = () => {
        const newSession = session$.value;
        if (newSession?.stream.id === initialSession.stream.id) {
          setSession(newSession);
        }
      };
      refresh();
      return session$.subscribe(refresh);
    }, [store, initialSession]);
    return session;
  };
}
