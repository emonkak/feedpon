import { BindActionCreators } from '@feedpon/foundation';
import type { SessionSettings } from '@feedpon/model';
import { AppStore } from '@feedpon/model';
import * as streamActions from '@feedpon/model/actions/stream';
import * as subscriptionActions from '@feedpon/model/actions/subscription';
import * as uiActions from '@feedpon/model/actions/ui';
import type { VirtualScrollerHandle } from '@feedpon/primitives';
import { createComponent, html } from 'barebind';
import { MainLayout } from '../layout/MainLayout.ts';
import { CategoryHeader } from './CategoryHeader.ts';
import { EntryList } from './EntryList.ts';
import { FeedHeader } from './FeedHeader.ts';
import { StreamFooter } from './StreamFooter.ts';
import { StreamHeader } from './StreamHeader.ts';

export interface StreamPageProps {
  streamId: string;
}

export const StreamPage = createComponent<StreamPageProps>(function StreamPage({
  streamId,
}) {
  const { state$ } = this.use(AppStore);
  const categories = this.use(state$.get('unsortedCategories'));
  const category = this.use(state$.get('categories')).get(streamId) ?? null;
  const feed = this.use(state$.get('feed'));
  const readCount = this.use(state$.get('readCounts')).get(streamId) ?? 0;
  const scrollDuration = this.use(
    state$.get('keyboardSettings').get('scrollDuration'),
  );
  const session = this.use(state$.get('session'));
  const stream = this.use(state$.get('stream'));
  const streamLoading = this.use(state$.get('streamLoading'));
  const streamUpdating = this.use(state$.get('streamUpdating'));
  const subscription =
    this.use(state$.get('subscriptions')).get(streamId) ?? null;
  const unreadCount = this.use(state$.get('unreadCounts')).get(streamId) ?? 0;

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
  } = this.use(BindActionCreators(AppStore, streamActions));
  const { toggleSidebar } = this.use(BindActionCreators(AppStore, uiActions));
  const {
    createCategory,
    createSubscription,
    deleteSubscription,
    updateSubscription,
  } = this.use(BindActionCreators(AppStore, subscriptionActions));

  const virtualScrollerRef = this.useRef<VirtualScrollerHandle<string> | null>(
    null,
  );

  this.useEffect(() => {
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

  this.useEffect(() => {
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
      ? EntryList({
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
        }).withKey(session.settings.layout)
      : null;

  const content = html`
    <${entryHeader}>
    <${entryList}>
  `;

  return MainLayout({
    header,
    footer,
    content,
  });
});
