import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  type Component,
  component,
  optional,
} from '@emonkak/ebit/directives.js';
import { bindActions } from 'feedpon-flux';
import { getStoreHook } from 'feedpon-flux/ebit.ts';
import type { EntryOrderKind, State, StreamViewKind } from 'feedpon-messaging';
import {
  createCategory,
  getSortedCategories,
} from 'feedpon-messaging/categories';
import {
  ALL_STREAM_ID,
  changeUnreadKeeping,
  fetchEntryComments,
  fetchFullContent,
  fetchMoreEntries,
  fetchStream,
  hideEntryComments,
  hideFullContents,
  markAllAsRead,
  markAsRead,
  markCategoryAsRead,
  markFeedAsRead,
  pinEntry,
  showEntryComments,
  showFullContents,
  unpinEntry,
} from 'feedpon-messaging/streams';
import {
  addToCategory,
  removeFromCategory,
  subscribe,
  unsubscribe,
} from 'feedpon-messaging/subscriptions';
import {
  changeActiveEntry,
  changeExpandedEntry,
  changeStreamView,
  resetReadEntry,
  selectStream,
  toggleSidebar,
  unselectStream,
} from 'feedpon-messaging/ui';
import * as CacheMap from 'feedpon-utils/CacheMap.ts';

import { MainLayout } from '../common/MainLayout.ts';
import { createEventHook } from '../common/hooks/eventHook.ts';
import { isMountedHook } from '../common/hooks/isMountedHook.ts';
import type { VirtualScrollListRef } from '../primitives/VirtualScrollList.ts';
import { CategoryHeader } from './CategoryHeader.ts';
import { EntryList } from './EntryList.ts';
import { FeedHeader } from './FeedHeader.ts';
import { StreamFooter } from './StreamFooter.ts';
import { StreamHeader } from './StreamHeader.ts';

export interface StreamPageProps {
  streamId: string;
}

export function StreamPage(
  { streamId }: StreamPageProps,
  context: RenderContext,
): TemplateResult {
  const {
    categories,
    isLoaded,
    isLoading,
    keepUnread,
    onAddToCategory,
    onChangeActiveEntry,
    onChangeExpandedEntry,
    onChangeStreamView,
    onChangeUnreadKeeping,
    onCreateCategory,
    onFetchEntryComments,
    onFetchFullContent,
    onFetchMoreEntries,
    onFetchStream,
    onHideEntryComments,
    onHideFullContents,
    onMarkAllAsRead,
    onMarkAsRead,
    onMarkCategoryAsRead,
    onMarkFeedAsRead,
    onPinEntry,
    onRemoveFromCategory,
    onResetReadEntry,
    onSelectStream,
    onShowEntryComments,
    onShowFullContents,
    onSubscribe,
    onToggleSidebar,
    onUnpinEntry,
    onUnselectStream,
    onUnsubscribe,
    streams,
    subscriptions,
  } = context.use(
    getStoreHook({
      mapStateToProps: (state: State) => {
        return {
          categories: state.categories,
          isLoaded: state.streams.isLoaded,
          isLoading: state.streams.isLoading,
          keepUnread: state.streams.keepUnread,
          streams: state.streams,
          subscriptions: state.subscriptions,
        };
      },
      mapDispatchToProps: bindActions({
        onAddToCategory: addToCategory,
        onChangeActiveEntry: changeActiveEntry,
        onChangeExpandedEntry: changeExpandedEntry,
        onChangeStreamView: changeStreamView,
        onChangeUnreadKeeping: changeUnreadKeeping,
        onCreateCategory: createCategory,
        onFetchEntryComments: fetchEntryComments,
        onFetchFullContent: fetchFullContent,
        onFetchMoreEntries: fetchMoreEntries,
        onFetchStream: fetchStream,
        onHideEntryComments: hideEntryComments,
        onHideFullContents: hideFullContents,
        onMarkAllAsRead: markAllAsRead,
        onMarkAsRead: markAsRead,
        onMarkCategoryAsRead: markCategoryAsRead,
        onMarkFeedAsRead: markFeedAsRead,
        onPinEntry: pinEntry,
        onRemoveFromCategory: removeFromCategory,
        onResetReadEntry: resetReadEntry,
        onSelectStream: selectStream,
        onShowEntryComments: showEntryComments,
        onShowFullContents: showFullContents,
        onSubscribe: subscribe,
        onToggleSidebar: toggleSidebar,
        onUnpinEntry: unpinEntry,
        onUnselectStream: unselectStream,
        onUnsubscribe: unsubscribe,
      }),
    }),
  );
  const isMounted = context.use(isMountedHook);
  const virtualListRef = context.useRef<VirtualScrollListRef | null>(null);

  const stream = CacheMap.get(streams.items, streamId) ?? {
    activeEntryIndex: -1,
    continuation: null,
    entries: [],
    expandedEntryIndex: -1,
    feed: null,
    fetchOptions: streams.defaultFetchOptions,
    fetchedAt: 0,
    readEntryIndex: -1,
    streamId,
    streamView: streams.defaultStreamView,
    title: '',
  };
  const streamCategory = categories.items[streamId] ?? null;
  const streamSubscription = subscriptions.items[streamId] ?? null;
  const canMarkAllEntriesAsRead =
    !streams.isMarking && stream.entries.some((entry) => !entry.markedAsRead);
  const canMarkStreamAsRead =
    !streams.isMarking &&
    (stream.streamId === ALL_STREAM_ID ||
      streamSubscription !== null ||
      streamCategory !== null);
  const shouldFetchStream =
    !stream ||
    !streams.isLoaded ||
    subscriptions.lastUpdatedAt > stream.fetchedAt;
  const sortedCategories = context.useMemo(
    () => getSortedCategories(categories.items),
    [categories.items],
  );
  const readEntries = context.useMemo(
    () =>
      stream.entries
        .slice(0, stream.readEntryIndex + 1)
        .filter((entry) => !entry.markedAsRead),
    [stream.entries],
  );

  context.useEffect(() => {
    onSelectStream(streamId);

    if (!keepUnread && readEntries.length > 0) {
      onMarkAsRead(readEntries);
    }

    if (shouldFetchStream) {
      onFetchStream(stream.streamId);
    }
  }, [streamId]);

  context.useEffect(() => {
    if (stream.expandedEntryIndex > -1) {
      virtualListRef.current?.scrollTo(stream.expandedEntryIndex);
    } else if (stream.activeEntryIndex > -1) {
      virtualListRef.current?.scrollTo(stream.activeEntryIndex);
    }
  }, [stream.expandedEntryIndex]);

  context.useEffect(() => {
    if (!isMounted()) {
      return;
    }
    if (!isLoaded && isLoading) {
      window.scrollTo(0, 0);
    }
  }, [isLoading]);

  context.useEffect(() => {
    if (!isMounted()) {
      return;
    }
    if (stream.activeEntryIndex < 0) {
      window.scrollTo(0, 0);
    }
  }, [streamId]);

  context.useEffect(() => {
    return () => {
      onUnselectStream();

      if (!keepUnread && readEntries.length > 0) {
        onMarkAsRead(readEntries);
      }
    };
  }, []);

  const handleChangeActiveEnetry = context.use(
    createEventHook((nextActiveEntryIndex: number) => {
      onChangeActiveEntry(stream.streamId, nextActiveEntryIndex);
    }),
  );

  const handleChangeEntryOrder = context.use(
    createEventHook((entryOrder: EntryOrderKind) => {
      window.scrollTo(0, 0);

      onFetchStream(stream.streamId, stream.streamView, {
        ...stream.fetchOptions,
        entryOrder,
      });
    }),
  );

  const handleChangeExpandedEntry = context.use(
    createEventHook((index: number) => {
      onChangeExpandedEntry(stream.streamId, index);
    }),
  );

  const handleChangeNumberOfEntries = context.use(
    createEventHook((numEntries: number) => {
      window.scrollTo(0, 0);

      onFetchStream(stream.streamId, stream.streamView, {
        ...stream.fetchOptions,
        numEntries,
      });
    }),
  );

  const handleChangeStreamView = context.use(
    createEventHook((streamView: StreamViewKind) => {
      onChangeStreamView(stream.streamId, streamView);
    }),
  );

  const handleClearReadEntries = context.use(
    createEventHook(() => {
      window.scrollTo(0, 0);

      onResetReadEntry(stream.streamId);
    }),
  );

  const handleCloseEntry = context.use(
    createEventHook(() => {
      onChangeExpandedEntry(stream.streamId, -1);
    }),
  );

  const handleLoadMoreEntries = context.use(
    createEventHook(() => {
      if (stream.continuation) {
        onFetchMoreEntries(
          stream.streamId,
          stream.continuation,
          stream.fetchOptions,
        );
      }
    }),
  );

  const handleMarkAllEntriesAsRead = context.use(
    createEventHook(() => {
      const unreadEntries = stream.entries.filter(
        (entry) => !entry.markedAsRead,
      );

      if (unreadEntries.length > 0) {
        onMarkAsRead(unreadEntries);
      }
    }),
  );

  const handleMarkStreamAsRead = context.use(
    createEventHook(() => {
      if (stream.streamId === ALL_STREAM_ID) {
        onMarkAllAsRead();
      } else if (streamCategory) {
        onMarkCategoryAsRead(streamCategory);
      } else if (streamSubscription) {
        onMarkFeedAsRead(streamSubscription);
      }
    }),
  );

  const handleReloadEntries = context.use(
    createEventHook(() => {
      window.scrollTo(0, 0);

      onFetchStream(stream.streamId, stream.streamView, stream.fetchOptions);
    }),
  );

  const handleScrollToEntry = context.use(
    createEventHook((index: number) => {
      virtualListRef.current?.scrollTo(index);
    }),
  );

  const handleToggleOnlyUnread = context.use(
    createEventHook(() => {
      window.scrollTo(0, 0);

      onFetchStream(stream.streamId, stream.streamView, {
        ...stream.fetchOptions,
        onlyUnread: !stream.fetchOptions.onlyUnread,
      });
    }),
  );

  const handleToggleUnreadKeeping = context.use(
    createEventHook(() => {
      onChangeUnreadKeeping(!keepUnread);
    }),
  );

  const header = component(StreamHeader, {
    activeEntryIndex: stream.activeEntryIndex,
    canMarkStreamAsRead: canMarkStreamAsRead,
    entries: stream.entries,
    feed: stream.feed,
    fetchOptions: stream.fetchOptions,
    isExpanded: stream.expandedEntryIndex > -1,
    isLoading: isLoading,
    keepUnread: keepUnread,
    onChangeEntryOrder: handleChangeEntryOrder,
    onChangeNumberOfEntries: handleChangeNumberOfEntries,
    onChangeStreamView: handleChangeStreamView,
    onClearReadPosition: handleClearReadEntries,
    onCloseEntry: handleCloseEntry,
    onMarkStreamAsRead: handleMarkStreamAsRead,
    onReloadEntries: handleReloadEntries,
    onScrollToEntry: handleScrollToEntry,
    onToggleOnlyUnread: handleToggleOnlyUnread,
    onToggleSidebar: onToggleSidebar,
    onToggleKeepUneread: handleToggleUnreadKeeping,
    readEntryIndex: stream.readEntryIndex,
    streamView: stream.streamView,
    title: stream.title,
  });

  const footer = component(StreamFooter, {
    canMarkAllEntriesAsRead: canMarkAllEntriesAsRead,
    hasMoreEntries: stream.continuation !== null,
    isLoading: isLoading,
    onLoadMoreEntries: handleLoadMoreEntries,
    onMarkAllEntiresAsRead: handleMarkAllEntriesAsRead,
  });

  let entryHeader: Component<any, any, any> | null;

  if (stream.feed) {
    entryHeader = component(FeedHeader, {
      categories: sortedCategories,
      feed: stream.feed,
      hasMoreEntries: !!stream.continuation,
      numEntries: stream.entries.length,
      onAddToCategory: onAddToCategory,
      onCreateCategory: onCreateCategory,
      onRemoveFromCategory: onRemoveFromCategory,
      onSubscribe: onSubscribe,
      onUnsubscribe: onUnsubscribe,
      subscription: streamSubscription,
    });
  } else if (streamCategory) {
    entryHeader = component(CategoryHeader, {
      category: streamCategory,
      hasMoreEntries: !!stream.continuation,
      numEntries: stream.entries.length,
    });
  } else {
    entryHeader = null;
  }

  const content = context.html`
    <${optional(entryHeader)}>
    <${component(EntryList, {
      activeEntryIndex: stream.activeEntryIndex,
      entries: stream.entries,
      expandedEntryIndex: stream.expandedEntryIndex,
      isLoaded,
      isLoading,
      onChangeActiveEntry: handleChangeActiveEnetry,
      onExpand: handleChangeExpandedEntry,
      onFetchComments: onFetchEntryComments,
      onFetchFullContent,
      onHideComments: onHideEntryComments,
      onHideFullContents,
      onPin: onPinEntry,
      onShowComments: onShowEntryComments,
      onShowFullContents,
      onUnpin: onUnpinEntry,
      readEntryIndex: stream.readEntryIndex,
      ref: virtualListRef,
      sameOrigin: stream.feed !== null,
      streamView: stream.streamView,
    })}>
  `;

  return context.html`<${component(MainLayout, {
    header,
    footer,
    content,
  })}>`;
}
