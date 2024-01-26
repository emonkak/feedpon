import React, { useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router';

import { bindActions } from 'feedpon-flux';
import connect from 'feedpon-flux/react/connect';
import type {
  Category,
  Entry,
  EntryOrderKind,
  State,
  Stream,
  StreamViewKind,
  Subscription,
} from 'feedpon-messaging';
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
  updateEntrySizes,
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
import * as CacheMap from 'feedpon-utils/CacheMap';
import type { VirtualListRef } from '../components/VirtualList';
import useEvent from '../hooks/useEvent';
import useIsMounted from '../hooks/useIsMounted';
import MainLayout from '../layouts/MainLayout';
import CategoryHeader from '../modules/CategoryHeader';
import EntryList from '../modules/EntryList';
import FeedHeader from '../modules/FeedHeader';
import StreamFooter from '../modules/StreamFooter';
import StreamNavbar from '../modules/StreamNavbar';

interface StreamPageProps {
  canMarkAllEntriesAsRead: boolean;
  canMarkStreamAsRead: boolean;
  categories: Category[];
  isLoaded: boolean;
  isLoading: boolean;
  keepUnread: boolean;
  onAddToCategory: typeof addToCategory;
  onChangeActiveEntry: typeof changeActiveEntry;
  onChangeExpandedEntry: typeof changeExpandedEntry;
  onChangeStreamView: typeof changeStreamView;
  onChangeUnreadKeeping: typeof changeUnreadKeeping;
  onCreateCategory: typeof createCategory;
  onFetchEntryComments: typeof fetchEntryComments;
  onFetchFullContent: typeof fetchFullContent;
  onFetchMoreEntries: typeof fetchMoreEntries;
  onFetchStream: typeof fetchStream;
  onHideEntryComments: typeof hideEntryComments;
  onHideFullContents: typeof hideFullContents;
  onMarkAllAsRead: typeof markAllAsRead;
  onMarkAsRead: typeof markAsRead;
  onMarkCategoryAsRead: typeof markCategoryAsRead;
  onMarkFeedAsRead: typeof markFeedAsRead;
  onPinEntry: typeof pinEntry;
  onRemoveFromCategory: typeof removeFromCategory;
  onResetReadEntry: typeof resetReadEntry;
  onSelectStream: typeof selectStream;
  onShowEntryComments: typeof showEntryComments;
  onShowFullContents: typeof showFullContents;
  onSubscribe: typeof subscribe;
  onToggleSidebar: typeof toggleSidebar;
  onUnpinEntry: typeof unpinEntry;
  onUnselectStream: typeof unselectStream;
  onUnsubscribe: typeof unsubscribe;
  onUpdateEntrySizes: typeof updateEntrySizes;
  readEntries: Entry[];
  shouldFetchStream: boolean;
  stream: Stream;
  streamCategory: Category | null;
  streamSubscription: Subscription | null;
}

function StreamPage({
  canMarkStreamAsRead,
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
  onUpdateEntrySizes,
  readEntries,
  shouldFetchStream,
  stream,
  streamCategory,
  canMarkAllEntriesAsRead,
  streamSubscription,
}: StreamPageProps) {
  const params = useParams<{ stream_id: string }>();
  const isMounted = useIsMounted();
  const virtualListRef = useRef<VirtualListRef | null>(null);

  useEffect(() => {
    const streamId = decodeURIComponent(params.stream_id);

    onSelectStream(streamId);

    if (!keepUnread && readEntries.length > 0) {
      onMarkAsRead(readEntries);
    }

    if (shouldFetchStream) {
      onFetchStream(streamId);
    }
  }, [params.stream_id]);

  useEffect(() => {
    if (stream.expandedEntryIndex > -1) {
      virtualListRef.current?.scrollTo(stream.expandedEntryIndex);
    } else if (stream.activeEntryIndex > -1) {
      virtualListRef.current?.scrollTo(stream.activeEntryIndex);
    }
  }, [stream.expandedEntryIndex]);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }
    if (!isLoaded && isLoading) {
      window.scrollTo(0, 0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }
    if (stream.activeEntryIndex < 0) {
      window.scrollTo(0, 0);
    }
  }, [params.stream_id]);

  useEffect(() => {
    return () => {
      onUnselectStream();

      if (!keepUnread && readEntries.length > 0) {
        onMarkAsRead(readEntries);
      }
    };
  }, []);

  const handleChangeActiveEnetry = useEvent((nextActiveEntryIndex: number) => {
    onChangeActiveEntry(stream.streamId, nextActiveEntryIndex);
  });

  const handleChangeEntryOrder = useEvent((entryOrder: EntryOrderKind) => {
    window.scrollTo(0, 0);

    onFetchStream(stream.streamId, stream.streamView, {
      ...stream.fetchOptions,
      entryOrder,
    });
  });

  const handleChangeExpandedEntry = useEvent((index: number) => {
    onChangeExpandedEntry(stream.streamId, index);
  });

  const handleChangeNumberOfEntries = useEvent((numEntries: number) => {
    window.scrollTo(0, 0);

    onFetchStream(stream.streamId, stream.streamView, {
      ...stream.fetchOptions,
      numEntries,
    });
  });

  const handleChangeStreamView = useEvent((streamView: StreamViewKind) => {
    onChangeStreamView(stream.streamId, streamView);
  });

  const handleClearReadEntries = useEvent(() => {
    window.scrollTo(0, 0);

    onResetReadEntry(stream.streamId);
  });

  const handleCloseEntry = useEvent(() => {
    onChangeExpandedEntry(stream.streamId, -1);
  });

  const handleUpdateBlockSizes = useEvent(
    (entrySizes: { [id: string]: number }) => {
      onUpdateEntrySizes(stream.streamId, entrySizes);
    },
  );

  const handleLoadMoreEntries = useEvent(() => {
    if (stream.continuation) {
      onFetchMoreEntries(
        stream.streamId,
        stream.continuation,
        stream.fetchOptions,
      );
    }
  });

  const handleMarkAllEntriesAsRead = useEvent(() => {
    const unreadEntries = stream.entries.filter((entry) => !entry.markedAsRead);

    if (unreadEntries.length > 0) {
      onMarkAsRead(unreadEntries);
    }
  });

  const handleMarkStreamAsRead = useEvent(() => {
    if (stream.streamId === ALL_STREAM_ID) {
      onMarkAllAsRead();
    } else if (streamCategory) {
      onMarkCategoryAsRead(streamCategory);
    } else if (streamSubscription) {
      onMarkFeedAsRead(streamSubscription);
    }
  });

  const handleReloadEntries = useEvent(() => {
    window.scrollTo(0, 0);

    onFetchStream(stream.streamId, stream.streamView, stream.fetchOptions);
  });

  const handleScrollToEntry = useEvent((index: number) => {
    virtualListRef.current?.scrollTo(index);
  });

  const handleToggleOnlyUnread = useEvent(() => {
    window.scrollTo(0, 0);

    onFetchStream(stream.streamId, stream.streamView, {
      ...stream.fetchOptions,
      onlyUnread: !stream.fetchOptions.onlyUnread,
    });
  });

  const handleToggleUnreadKeeping = useEvent(() => {
    onChangeUnreadKeeping(!keepUnread);
  });

  const navbar = (
    <StreamNavbar
      activeEntryIndex={stream.activeEntryIndex}
      canMarkStreamAsRead={canMarkStreamAsRead}
      entries={stream.entries}
      feed={stream.feed}
      fetchOptions={stream.fetchOptions}
      isExpanded={stream.expandedEntryIndex > -1}
      isLoading={isLoading}
      keepUnread={keepUnread}
      onChangeEntryOrder={handleChangeEntryOrder}
      onChangeNumberOfEntries={handleChangeNumberOfEntries}
      onChangeStreamView={handleChangeStreamView}
      onClearReadPosition={handleClearReadEntries}
      onCloseEntry={handleCloseEntry}
      onMarkStreamAsRead={handleMarkStreamAsRead}
      onReloadEntries={handleReloadEntries}
      onScrollToEntry={handleScrollToEntry}
      onToggleOnlyUnread={handleToggleOnlyUnread}
      onToggleSidebar={onToggleSidebar}
      onToggleUnreadKeeping={handleToggleUnreadKeeping}
      readEntryIndex={stream.readEntryIndex}
      streamView={stream.streamView}
      title={stream.title}
    />
  );

  const footer = (
    <StreamFooter
      canMarkAllEntriesAsRead={canMarkAllEntriesAsRead}
      hasMoreEntries={stream.continuation !== null}
      isLoading={isLoading}
      onLoadMoreEntries={handleLoadMoreEntries}
      onMarkAllEntiresAsRead={handleMarkAllEntriesAsRead}
    />
  );

  let streamHeader;

  if (stream.feed) {
    streamHeader = (
      <FeedHeader
        categories={categories}
        feed={stream.feed}
        hasMoreEntries={!!stream.continuation}
        numEntries={stream.entries.length}
        onAddToCategory={onAddToCategory}
        onCreateCategory={onCreateCategory}
        onRemoveFromCategory={onRemoveFromCategory}
        onSubscribe={onSubscribe}
        onUnsubscribe={onUnsubscribe}
        subscription={streamSubscription}
      />
    );
  } else if (streamCategory) {
    streamHeader = (
      <CategoryHeader
        category={streamCategory}
        hasMoreEntries={!!stream.continuation}
        numEntries={stream.entries.length}
      />
    );
  } else {
    streamHeader = null;
  }

  return (
    <MainLayout header={navbar} footer={footer}>
      {streamHeader}
      <EntryList
        activeEntryIndex={stream.activeEntryIndex}
        blockSizes={stream.entrySizes}
        entries={stream.entries}
        expandedEntryIndex={stream.expandedEntryIndex}
        isLoaded={isLoaded}
        isLoading={isLoading}
        onChangeActiveEntry={handleChangeActiveEnetry}
        onExpand={handleChangeExpandedEntry}
        onFetchComments={onFetchEntryComments}
        onFetchFullContent={onFetchFullContent}
        onHideComments={onHideEntryComments}
        onHideFullContents={onHideFullContents}
        onPin={onPinEntry}
        onShowComments={onShowEntryComments}
        onShowFullContents={onShowFullContents}
        onUnpin={onUnpinEntry}
        onUpdateBlockSizes={handleUpdateBlockSizes}
        readEntryIndex={stream.readEntryIndex}
        ref={virtualListRef}
        sameOrigin={stream.feed !== null}
        streamView={stream.streamView}
      />
    </MainLayout>
  );
}

export default connect(StreamPage, {
  mapStateToProps: (state: State) => {
    const params = useParams<{ stream_id: string }>();

    const stream = useMemo(() => {
      const streamId = decodeURIComponent(params.stream_id);
      return (
        CacheMap.get(state.streams.items, streamId) ?? {
          activeEntryIndex: -1,
          continuation: null,
          entries: [],
          entrySizes: {},
          expandedEntryIndex: -1,
          feed: null,
          fetchOptions: state.streams.defaultFetchOptions,
          fetchedAt: 0,
          readEntryIndex: -1,
          streamId,
          streamView: state.streams.defaultStreamView,
          title: '',
        }
      );
    }, [
      state.streams.items,
      state.streams.defaultStreamView,
      state.streams.defaultFetchOptions,
      params.stream_id,
    ]);

    const categories = useMemo(
      () => getSortedCategories(state.categories.items),
      [state.categories.items],
    );

    const streamCategory = useMemo(() => {
      const streamId = decodeURIComponent(params.stream_id);
      return state.categories.items[streamId] ?? null;
    }, [params.stream_id]);

    const streamSubscription = useMemo(() => {
      const streamId = decodeURIComponent(params.stream_id);
      return state.subscriptions.items[streamId] ?? null;
    }, [state.subscriptions.items, params.stream_id]);

    const readEntries = useMemo(
      () =>
        stream.entries
          .slice(0, stream.readEntryIndex + 1)
          .filter((entry) => !entry.markedAsRead),
      [stream],
    );

    const canMarkAllEntriesAsRead = useMemo(
      () =>
        !state.streams.isMarking &&
        stream.entries.some((entry) => !entry.markedAsRead),
      [stream, state.streams.isMarking],
    );

    const canMarkStreamAsRead = useMemo(
      () =>
        !state.streams.isMarking &&
        (stream.streamId === ALL_STREAM_ID ||
          streamSubscription !== null ||
          streamCategory !== null),
      [stream, streamSubscription, streamCategory, state.streams.isMarking],
    );

    const shouldFetchStream = useMemo(
      () =>
        !stream ||
        !state.streams.isLoaded ||
        state.subscriptions.lastUpdatedAt > stream.fetchedAt,
      [stream, state.streams.isLoaded, state.subscriptions.lastUpdatedAt],
    );

    return {
      canMarkAllEntriesAsRead,
      canMarkStreamAsRead,
      categories,
      isLoaded: state.streams.isLoaded,
      isLoading: state.streams.isLoading,
      keepUnread: state.streams.keepUnread,
      readEntries,
      shouldFetchStream,
      stream,
      streamCategory,
      streamSubscription,
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
    onUpdateEntrySizes: updateEntrySizes,
  }),
});
