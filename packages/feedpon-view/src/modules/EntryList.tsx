import React, {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';

import type { Entry, StreamViewKind } from 'feedpon-messaging';
import * as SmoothScroll from 'feedpon-utils/SmoothScroll';
import VirtualList, {
  BlankSpaces,
  Dimensions,
  VirtualListRef,
} from '../components/VirtualList';
import useEvent from '../hooks/useEvent';
import EntryItem from './EntryItem';
import {
  CollapsedEntryPlaceholder,
  ExpandedEntryPlaceholder,
} from './EntryPlaceholder';

interface EntryListProps {
  activeEntryIndex: number;
  blockSizes: { [id: string]: number };
  entries: Entry[];
  expandedEntryIndex: number;
  isLoaded: boolean;
  isLoading: boolean;
  onChangeActiveEntry: (index: number) => void;
  onExpand: (index: number) => void;
  onFetchComments: (entryId: string | number, url: string) => void;
  onFetchFullContent: (entryId: string | number, url: string) => void;
  onHideComments: (entryId: string | number) => void;
  onHideFullContents: (entryId: string | number) => void;
  onPin: (entryId: string | number) => void;
  onShowComments: (entryId: string | number) => void;
  onShowFullContents: (entryId: string | number) => void;
  onUnpin: (entryId: string | number) => void;
  onUpdateBlockSizes: (blockSizes: { [id: string]: number }) => void;
  readEntryIndex: number;
  sameOrigin: boolean;
  streamView: StreamViewKind;
}

interface RenderingItem {
  id: string;
  entry: Entry;
  isActive: boolean;
  isExpanded: boolean;
  sameOrigin: boolean;
}

export default forwardRef(EntryList);

function EntryList(
  {
    activeEntryIndex,
    blockSizes,
    entries,
    expandedEntryIndex,
    isLoaded,
    isLoading,
    onChangeActiveEntry,
    onExpand,
    onFetchComments,
    onFetchFullContent,
    onHideComments,
    onHideFullContents,
    onPin,
    onShowComments,
    onShowFullContents,
    onUnpin,
    onUpdateBlockSizes,
    sameOrigin,
    streamView,
  }: EntryListProps,
  ref: React.ForwardedRef<VirtualListRef>,
) {
  const getHeaderHeight = useHeaderHeight();

  const handleUpdateDimensions = useEvent((dimensions) => {
    const newActiveEntryIndex = getActiveIndex(dimensions, getHeaderHeight());

    if (newActiveEntryIndex !== activeEntryIndex) {
      onChangeActiveEntry(newActiveEntryIndex);
    }
  });

  const items = useMemo(
    () =>
      entries.map((entry, index) => {
        const isActive = activeEntryIndex === index;
        const isExpanded =
          streamView === 'expanded' || expandedEntryIndex === index;
        const id = (isExpanded ? 'e' : 'c') + '__' + entry.entryId;

        return {
          id,
          entry,
          isActive,
          isExpanded,
          sameOrigin,
        };
      }),
    [entries, activeEntryIndex, expandedEntryIndex, sameOrigin, streamView],
  );

  const scrollBy = useCallback((x: number, y: number) => {
    window.scrollBy(x, y - getHeaderHeight());
  }, []);

  const renderItem = useEvent((
    { entry, isActive, isExpanded, sameOrigin }: RenderingItem,
    index: number,
    ref: React.RefCallback<Element>,
  ) => {
    return (
      <EntryItem
        entry={entry}
        index={index}
        isActive={isActive}
        isExpanded={isExpanded}
        key={entry.entryId}
        onExpand={onExpand}
        onFetchComments={onFetchComments}
        onFetchFullContent={onFetchFullContent}
        onHideComments={onHideComments}
        onHideFullContents={onHideFullContents}
        onPin={onPin}
        onShowComments={onShowComments}
        onShowFullContents={onShowFullContents}
        onUnpin={onUnpin}
        ref={ref}
        sameOrigin={sameOrigin}
      />
    );
  });

  if (isLoading && !isLoaded) {
    if (streamView === 'expanded') {
      return (
        <div className="entry-list">
          <ExpandedEntryPlaceholder />
          <ExpandedEntryPlaceholder />
          <ExpandedEntryPlaceholder />
          <ExpandedEntryPlaceholder />
          <ExpandedEntryPlaceholder />
        </div>
      );
    } else {
      return (
        <div className="entry-list">
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
          <CollapsedEntryPlaceholder />
        </div>
      );
    }
  }

  return (
    <VirtualList<RenderingItem, 'id', string>
      assumedItemSize={streamView === 'expanded' ? 800 : 100}
      idAttribute="id"
      initialBlockSizes={blockSizes}
      initialItemIndex={
        expandedEntryIndex >= 0 ? expandedEntryIndex : activeEntryIndex
      }
      items={items}
      onUpdateBlockSizes={onUpdateBlockSizes}
      onUpdateDimensions={handleUpdateDimensions}
      ref={ref}
      renderItem={renderItem}
      renderList={renderList}
      scheduleUpdate={scheduleUpdate}
      scrollBy={scrollBy}
    />
  );
}

function getActiveIndex(
  dimensions: Dimensions<string>,
  scrollPadding: number,
): number {
  const { blockInsets } = dimensions;

  if (blockInsets.length === 0) {
    return -1;
  }

  const { viewportInset } = dimensions;
  const bottomInsets = blockInsets[blockInsets.length - 1]!;

  const viewportTop = viewportInset.start + scrollPadding;
  const viewportBottom = viewportInset.end;

  if (Math.abs(bottomInsets.end - viewportTop) < 1) {
    return blockInsets.length;
  }

  let activeIndex = -1;
  let maxVisibleHeight = 0;

  for (let i = 0, l = blockInsets.length; i < l; i++) {
    const blockInset = blockInsets[i]!;

    if (
      Math.ceil(blockInset.start) >= Math.floor(viewportTop) &&
      Math.floor(blockInset.end) <= Math.ceil(viewportBottom)
    ) {
      return i;
    }

    if (blockInset.start < viewportBottom && blockInset.end > viewportTop) {
      const visibleSize =
        Math.min(blockInset.end, viewportBottom) -
        Math.max(blockInset.start, viewportTop);
      if (visibleSize > maxVisibleHeight) {
        maxVisibleHeight = visibleSize;
        activeIndex = i;
      }
    } else {
      if (activeIndex > -1) {
        break;
      }
    }
  }

  return activeIndex;
}

function renderList(
  items: React.ReactElement<unknown>[],
  blankSpaces: BlankSpaces,
  ref: React.RefObject<Element>,
) {
  return (
    <div className="entry-list" ref={ref as React.RefObject<HTMLDivElement>}>
      <div style={{ height: blankSpaces.above, overflowAnchor: 'none' }}></div>
      {items}
      <div style={{ height: blankSpaces.below, overflowAnchor: 'none' }}></div>
    </div>
  );
}

function scheduleUpdate(callback: VoidFunction) {
  SmoothScroll.scrollLock(window).then(callback);
}

function useHeaderHeight() {
  const headerHeightRef = useRef(0);

  useLayoutEffect(() => {
    const header = document.querySelector('.l-header');
    if (header) {
      headerHeightRef.current = header.getBoundingClientRect().height;
    }
  }, []);

  return () => headerHeightRef.current;
}
