import { createComponent, Keyed, type RenderContext } from 'barebind';
import type { SessionSettings } from 'feedpon-store';
import { AppStore } from 'feedpon-store';
import * as streamActions from 'feedpon-store/actions/stream';
import * as subscriptionActions from 'feedpon-store/actions/subscription';
import * as uiActions from 'feedpon-store/actions/ui';
import { BindActionCreators } from 'store';
import { MainLayout } from '../layout/MainLayout.ts';
import type { VirtualScrollerHandle } from '../primitives/VirtualScroller.ts';
import { CategoryHeader } from './CategoryHeader.ts';
import { EntryList } from './EntryList.ts';
import { FeedHeader } from './FeedHeader.ts';
import { StreamFooter } from './StreamFooter.ts';
import { StreamHeader } from './StreamHeader.ts';

export interface StreamPageProps {
  streamId: string;
  store: AppStore;
}

export const StreamPage = createComponent(function StreamPage(
  { streamId, store }: StreamPageProps,
  $: RenderContext,
): unknown {
  const { state$ } = store;
  const categories = $.use(state$.get('unsortedCategories'));
  const category = $.use(state$.get('categories')).get(streamId) ?? null;
  const feed = $.use(state$.get('feed'));
  const readCount = $.use(state$.get('readCounts')).get(streamId) ?? 0;
  const scrollDuration = $.use(
    state$.get('keyboardSettings').get('scrollDuration'),
  );
  const session = $.use(state$.get('session'));
  const stream = $.use(state$.get('stream'));
  const streamLoading = $.use(state$.get('streamLoading'));
  const streamUpdating = $.use(state$.get('streamUpdating'));
  const subscription = $.use(state$.get('subscriptions')).get(streamId) ?? null;
  const unreadCount = $.use(state$.get('unreadCounts')).get(streamId) ?? 0;

  const {
    expandEntry,
    fetchFullContents,
    fetchHatenaBookmarkCounts,
    fetchHatenaBookmarkEntry,
    fetchStream,
    focusEntry,
    markStreamAsRead,
    quitSession,
    shrinkEntry,
    startSession,
    toggleFullContents,
    toggleHatenaBookmarkEntry,
    updateSessionSettings,
  } = $.use(BindActionCreators(AppStore, streamActions));
  const { toggleSidebar } = $.use(BindActionCreators(AppStore, uiActions));
  const {
    createCategory,
    createSubscription,
    deleteSubscription,
    updateSubscription,
  } = $.use(BindActionCreators(AppStore, subscriptionActions));

  const virtualScrollerRef = $.useRef<VirtualScrollerHandle | null>(null);

  $.useLayoutEffect(() => {
    if (session === null || session.id !== streamId) {
      startSession(streamId);
    } else {
      if (stream === null) {
        fetchStream().then(() => fetchHatenaBookmarkCounts());
      } else if (session.focusIndex < 0) {
        window.scrollTo(0, 0);
      } else if (session.focusIndex >= stream.items.length) {
        window.scrollTo(0, document.body.scrollHeight);
      } else {
        virtualScrollerRef.current?.scrollToIndex(session.focusIndex);
      }
    }
  }, [session?.id, streamId]);

  $.useEffect(() => {
    return () => {
      quitSession();
    };
  }, []);

  const handleEntryExpand = (index: number) => {
    expandEntry(index);
    virtualScrollerRef.current?.scrollToIndex(index);
  };

  const handleEntrySelect = (index: number) => {
    focusEntry(index);
    virtualScrollerRef.current?.scrollToIndex(index);
  };

  const handleStreamLoadMoreEntries = async () => {
    await fetchStream(stream?.continuation);
    await fetchHatenaBookmarkCounts();
  };

  const handleStreamReload = async () => {
    await fetchStream();
    await fetchHatenaBookmarkCounts();
  };

  const handleSessionSettingsUpdate = async (
    newSessionSettings: SessionSettings,
    oldSessionSettings: SessionSettings,
  ) => {
    updateSessionSettings(newSessionSettings);
    if (
      newSessionSettings.count !== oldSessionSettings.count ||
      newSessionSettings.ranked !== oldSessionSettings.ranked ||
      newSessionSettings.unreadOnly !== oldSessionSettings.unreadOnly
    ) {
      await fetchStream();
      await fetchHatenaBookmarkCounts();
    }
  };

  const header = StreamHeader({
    isStreamLoading: streamLoading,
    isStreamUpdating: streamUpdating,
    onEntrySelect: handleEntrySelect,
    onEntryShrink: shrinkEntry,
    onSessionSettingsUpdate: handleSessionSettingsUpdate,
    onSidebarToggle: toggleSidebar,
    onStreamMarkAsRead: markStreamAsRead,
    onStreamReload: handleStreamReload,
    session,
    stream,
  });

  const footer = StreamFooter({
    hasMoreEntries: stream?.continuation !== undefined,
    isStreamLoading: streamLoading,
    canMarkAsRead: !streamUpdating && unreadCount > readCount,
    onStreamLoadMoreEntries: handleStreamLoadMoreEntries,
    onStreamMarkAsRead: markStreamAsRead,
  });

  const entryHeader: unknown =
    feed !== null
      ? FeedHeader({
          categories,
          feed,
          onCategoryCreate: createCategory,
          onSubscriptionCreate: createSubscription,
          onSubscriptionDelete: deleteSubscription,
          onSubscriptionUpdate: updateSubscription,
          subscription,
        })
      : category !== null
        ? CategoryHeader({
            category,
          })
        : null;
  const entryList =
    session !== null
      ? Keyed(
          session.settings.layout,
          EntryList({
            isStreamLoading: streamLoading,
            onEntryExpand: handleEntryExpand,
            onEntryFocus: focusEntry,
            onFullContentsFetch: fetchFullContents,
            onFullContentsToggle: toggleFullContents,
            onHatenaBookmarkEntryFetch: fetchHatenaBookmarkEntry,
            onHatenaBookmarkEntryToggle: toggleHatenaBookmarkEntry,
            scrollDuration,
            session,
            stream,
            virtualScrollerRef,
          }),
        )
      : null;

  const content = $.html`
    <${entryHeader}>
    <${entryList}>
  `;

  return MainLayout({
    header,
    footer,
    content,
  });
});
