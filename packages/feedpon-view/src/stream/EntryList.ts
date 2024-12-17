import type { RefObject, RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  type ElementRef,
  component,
  ref,
  styleMap,
} from '@emonkak/ebit/directives.js';
import type { Entry, StreamViewKind } from 'feedpon-messaging';
import * as SmoothScroll from 'feedpon-utils/SmoothScroll';

import {
  type BlankSpaces,
  type Dimensions,
  VirtualScrollList,
  type VirtualScrollListRef,
} from '../common/components/VirtualScrollList';
import { createEventHook } from '../common/hooks/eventHook';
import { EntryItem } from './EntryItem';
import {
  CollapsedEntryPlaceholder,
  ExpandedEntryPlaceholder,
} from './EntryPlaceholder';

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

export function EntryList(
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
  context: RenderContext,
): TemplateResult {
  const getHeaderHeight = context.use(getHeaderHeightHook);

  const handleUpdateDimensions = context.use(
    createEventHook((dimensions: Dimensions) => {
      const newActiveEntryIndex = getActiveIndex(dimensions, getHeaderHeight());

      if (newActiveEntryIndex !== activeEntryIndex) {
        onChangeActiveEntry(newActiveEntryIndex);
      }
    }),
  );

  const items = context.useMemo(
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

  const scrollBy = context.useCallback((x: number, y: number) => {
    window.scrollBy(x, y - getHeaderHeight());
  }, []);

  const renderItem = context.useCallback(
    (
      { entry, isActive, isExpanded, sameOrigin }: RenderingItem,
      index: number,
      ref: ElementRef,
    ) => {
      return component(EntryItem, {
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
      return context.html`
        <div class="entry-list">
          <${component(ExpandedEntryPlaceholder, {})}>
          <${component(ExpandedEntryPlaceholder, {})}>
          <${component(ExpandedEntryPlaceholder, {})}>
          <${component(ExpandedEntryPlaceholder, {})}>
          <${component(ExpandedEntryPlaceholder, {})}>
        </div>
      `;
    } else {
      return context.html`
        <div class="entry-list">
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
          <${component(CollapsedEntryPlaceholder, {})}>
        </div>
      `;
    }
  }

  return context.html`<${component(VirtualScrollList<RenderingItem, unknown>, {
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
  })}>`;
}

function getActiveIndex(dimensions: Dimensions, scrollPadding: number): number {
  const { blockInsets } = dimensions;

  if (blockInsets.length === 0) {
    return -1;
  }

  const { viewportInset } = dimensions;
  const bottomInsets = blockInsets[blockInsets.length - 1]!;

  const viewportTop = viewportInset.start + scrollPadding;
  const viewportBottom = viewportInset.end;

  if (Math.abs(bottomInsets.end - viewportTop) <= 1.0) {
    return blockInsets.length;
  }

  let activeIndex = -1;
  let maxVisibleHeight = 0;

  for (let i = 0, l = blockInsets.length; i < l; i++) {
    const blockInset = blockInsets[i]!;

    if (
      blockInset.start + 0.5 >= viewportTop - 0.5 &&
      blockInset.end - 0.5 <= viewportBottom + 0.5
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

function getHeaderHeightHook(context: RenderContext): () => number {
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
  context: RenderContext,
): TemplateResult {
  return context.html`
    <div class="entry-list" ref=${ref(elementRef)}>
      <div style=${styleMap({ height: blankSpaces.above + 'px', overflowAnchor: 'none' })}></div>
      <${children}>
      <div style=${styleMap({ height: blankSpaces.below + 'px', overflowAnchor: 'none' })}></div>
    </div>
  `;
}

function scheduleUpdate(callback: VoidFunction) {
  SmoothScroll.scrollLock(window).then(callback);
}
