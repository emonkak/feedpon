import {
  createComponent,
  type ElementRef,
  type HookContext,
  type RefObject,
  type RenderContext,
} from 'barebind';
import type { Entry, StreamViewKind } from 'feedpon-messaging';
import * as SmoothScroll from 'feedpon-utils/SmoothScroll.ts';

import { createEventHook } from '../common/hooks/eventHook.ts';
import {
  type BlankSpaces,
  type Dimensions,
  VirtualScrollList,
  type VirtualScrollListRef,
} from '../primitives/VirtualScrollList.ts';
import { EntryItem } from './EntryItem.ts';
import {
  CollapsedEntryPlaceholder,
  ExpandedEntryPlaceholder,
} from './EntryPlaceholder.ts';

interface EntryListProps {
  activeEntryIndex: number;
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
  readEntryIndex: number;
  ref: RefObject<VirtualScrollListRef | null>;
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

export const EntryList = createComponent(function EntryList(
  {
    activeEntryIndex,
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
    sameOrigin,
    streamView,
    ref,
  }: EntryListProps,
  $: RenderContext,
): unknown {
  const getHeaderHeight = $.use(getHeaderHeightHook);

  const handleUpdateDimensions = $.use(
    createEventHook((dimensions: Dimensions) => {
      const newActiveEntryIndex = getActiveIndex(dimensions, getHeaderHeight());

      if (newActiveEntryIndex !== activeEntryIndex) {
        onChangeActiveEntry(newActiveEntryIndex);
      }
    }),
  );

  const items = $.useMemo(
    () =>
      entries.map((entry, index) => {
        const isActive = activeEntryIndex === index;
        const isExpanded =
          streamView === 'expanded' || expandedEntryIndex === index;
        const id = (isExpanded ? 'e' : 'c') + '.' + entry.entryId;

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

  const scrollBy = $.useCallback((x: number, y: number) => {
    window.scrollBy(x, y - getHeaderHeight());
  }, []);

  const renderItem = $.useCallback(
    (
      { entry, isActive, isExpanded, sameOrigin }: RenderingItem,
      index: number,
      ref: ElementRef,
    ) => {
      return EntryItem({
        entry,
        index,
        isActive,
        isExpanded,
        onExpand,
        onFetchComments,
        onFetchFullContent,
        onHideComments,
        onHideFullContents,
        onPin,
        onShowComments,
        onShowFullContents,
        onUnpin,
        ref,
        sameOrigin,
      });
    },
    [
      onFetchComments,
      onFetchFullContent,
      onHideComments,
      onHideFullContents,
      onPin,
      onShowComments,
      onShowFullContents,
      onUnpin,
    ],
  );

  if (isLoading && !isLoaded) {
    if (streamView === 'expanded') {
      return $.html`
        <div class="entry-list">
          <${ExpandedEntryPlaceholder({})}>
          <${ExpandedEntryPlaceholder({})}>
          <${ExpandedEntryPlaceholder({})}>
          <${ExpandedEntryPlaceholder({})}>
          <${ExpandedEntryPlaceholder({})}>
        </div>
      `;
    } else {
      return $.html`
        <div class="entry-list">
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
          <${CollapsedEntryPlaceholder({})}>
        </div>
      `;
    }
  }

  return VirtualScrollList({
    assumedItemSize: streamView === 'expanded' ? 800 : 100,
    initialItemIndex:
      expandedEntryIndex >= 0 ? expandedEntryIndex : activeEntryIndex,
    items,
    onUpdateDimensions: handleUpdateDimensions,
    ref,
    renderItem,
    renderList,
    scheduleUpdate,
    scrollBy,
  });
});

function getActiveIndex(dimensions: Dimensions, scrollPadding: number): number {
  const { blockPositions } = dimensions;

  if (blockPositions.length === 0) {
    return -1;
  }

  const { screen } = dimensions;
  const bottomInsets = blockPositions[blockPositions.length - 1]!;

  const screenTop = screen.top + scrollPadding;
  const screenBottom = screen.bottom;

  if (Math.abs(bottomInsets.end - screenTop) <= 1.0) {
    return blockPositions.length;
  }

  let activeIndex = -1;
  let maxVisibleHeight = 0;

  for (let i = 0, l = blockPositions.length; i < l; i++) {
    const blockInset = blockPositions[i]!;

    if (
      blockInset.start + 0.5 >= screenTop - 0.5 &&
      blockInset.end - 0.5 <= screenBottom + 0.5
    ) {
      return i;
    }

    if (blockInset.start < screenBottom && blockInset.end > screenTop) {
      const visibleSize =
        Math.min(blockInset.end, screenBottom) -
        Math.max(blockInset.start, screenTop);
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

function getHeaderHeightHook(context: HookContext): () => number {
  const headerHeightRef = context.useRef(0);

  context.useLayoutEffect(() => {
    const header = document.querySelector('.l-header');
    if (header) {
      headerHeightRef.current = header.getBoundingClientRect().height;
    }
  }, []);

  return () => headerHeightRef.current;
}

function renderList(
  children: unknown,
  blankSpaces: BlankSpaces,
  elementRef: ElementRef,
  $: RenderContext,
): unknown {
  return $.html`
    <div :ref=${elementRef} class="entry-list">
      <div :style=${{ height: blankSpaces.above + 'px', overflowAnchor: 'none' }}></div>
      <${children}>
      <div :style=${{ height: blankSpaces.below + 'px', overflowAnchor: 'none' }}></div>
    </div>
  `;
}

function scheduleUpdate(callback: VoidFunction) {
  SmoothScroll.scrollLock(window).then(callback);
}
