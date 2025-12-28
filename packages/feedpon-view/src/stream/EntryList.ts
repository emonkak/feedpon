import {
  createComponent,
  type Ref,
  type RefObject,
  type RenderContext,
} from 'barebind';
import { EventCallback } from 'barebind/addons/hooks';
import type { Entry, ScrollTarget, Session, Stream } from 'feedpon-store';

import {
  type BlankSpaces,
  type Dimensions,
  VirtualScrollList,
  type VirtualScrollListRef,
} from '../primitives/VirtualScrollList.ts';
import { EntryView } from './EntryView.ts';

export interface EntryListProps {
  isStreamLoading: boolean;
  onEntryExpand: (index: number) => void;
  onEntryFocus: (index: number) => void;
  onFullContentsFetch: (entryId: string) => Promise<void>;
  onFullContentsToggle: (entryId: string, shown: boolean) => void;
  onHatenaBookmarkEntryFetch: (entryId: string) => Promise<void>;
  onHatenaBookmarkEntryToggle: (entryId: string, shown: boolean) => void;
  ref: RefObject<VirtualScrollListRef | null>;
  session: Session;
  stream: Stream | null;
  waitForScroll: (target: ScrollTarget) => Promise<void>;
}

export const EntryList = createComponent(function EntryList(
  {
    isStreamLoading,
    onEntryExpand,
    onEntryFocus,
    onFullContentsFetch,
    onFullContentsToggle,
    onHatenaBookmarkEntryFetch,
    onHatenaBookmarkEntryToggle,
    ref,
    session,
    stream,
    waitForScroll,
  }: EntryListProps,
  $: RenderContext,
): unknown {
  const getHeaderHeight = $.use(getHeaderHeightHook);

  const scheduleUpdate = $.useCallback((callback: () => void) => {
    waitForScroll(window).then(callback);
  }, []);

  const handleUpdateDimensions = $.use(
    EventCallback((dimensions: Dimensions) => {
      const focusIndex = getFocusIndex(dimensions, getHeaderHeight());

      if (session !== null && focusIndex !== session.focusIndex) {
        onEntryFocus(focusIndex);
      }
    }),
  );

  const scrollBy = $.useCallback((x: number, y: number) => {
    window.scrollBy(x, y - getHeaderHeight());
  }, []);

  if (isStreamLoading && stream === null) {
    if (session.settings.layout === 'full') {
      return $.html`
        <div class="entry-list">
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
        </div>
      `;
    } else {
      return $.html`
        <div class="entry-list">
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
          <${CompactEntryPlaceholder({})}>
        </div>
      `;
    }
  }

  return VirtualScrollList({
    assumedItemSize: session.settings.layout === 'full' ? 800 : 100,
    initialItemIndex:
      session.expandedIndex >= 0 ? session.expandedIndex : session.focusIndex,
    items: stream?.items ?? [],
    onUpdateDimensions: handleUpdateDimensions,
    ref,
    renderItem: (entry: Entry, index: number, ref: Ref<Element>) => {
      return EntryView({
        entry,
        index,
        isSelected: index === session.focusIndex,
        isExpanded:
          session.settings.layout === 'full' || index === session.expandedIndex,
        onEntryExpand,
        onFullContentsFetch,
        onFullContentsToggle,
        onHatenaBookmarkEntryFetch,
        onHatenaBookmarkEntryToggle,
        ref,
      });
    },
    renderList: (
      children: unknown,
      blankSpaces: BlankSpaces,
      ref: Ref<Element>,
      $: RenderContext,
    ) => {
      return $.html`
        <div :ref=${ref} class="entry-list">
          <div :style=${{ height: blankSpaces.above + 'px', overflowAnchor: 'none' }}></div>
          <${children}>
          <div :style=${{ height: blankSpaces.below + 'px', overflowAnchor: 'none' }}></div>
        </div>
      `;
    },
    scheduleUpdate,
    scrollBy,
  });
});

export const FullEntryPlaceholder = createComponent(
  function FullEntryPlaceholder(_props: {}, $: RenderContext): unknown {
    return $.html`
      <article class="entry is-expanded">
        <div class="container">
          <header class="entry-header">
            <h2 class="entry-title">
              <span class="placeholder placeholder-80 animation-shining"></span>
            </h2>
            <div class="entry-metadata">
              <span class="placeholder placeholder-60 animation-shining"></span>
            </div>
          </header>
          <div class="entry-content u-clearfix u-text-wrap">
            <p>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-60 animation-shining"></span>
            </p>
            <p>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-80 animation-shining"></span>
            </p>
            <p>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-100 animation-shining"></span>
              <span class="placeholder placeholder-40 animation-shining"></span>
            </p>
          </div>
          <footer class="entry-footer">
            <div class="button-toolbar u-text-center">
              <span class="button button-pill button-outline-default">
                <i class="icon icon-20 icon-comments"></i>
              </span>
              <span class="button button-pill button-outline-default">
                <i class="icon icon-20 icon-share"></i>
              </span>
              <span class="button button-pill button-outline-default">
                <i class="icon icon-20 icon-external-link"></i>
              </span>
            </div>
          </footer>
        </div>
      </article>
    `;
  },
);

export const CompactEntryPlaceholder = createComponent(
  function CompactEntryPlaceholder(_props: {}, $: RenderContext): unknown {
    return $.html`
      <article class="entry">
        <div class="container">
          <header class="entry-header">
            <h2 class="entry-title">
              <span class="placeholder placeholder-80 animation-shining"></span>
            </h2>
            <div class="entry-metadata">
              <span class="placeholder placeholder-60 animation-shining"></span>
            </div>
          </header>
          <div class="entry-summary">
            <span class="placeholder placeholder-100 animation-shining"></span>
          </div>
        </div>
      </article>
    `;
  },
);

function getFocusIndex(dimensions: Dimensions, scrollPadding: number): number {
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

  let focusIndex = -1;
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
        focusIndex = i;
      }
    } else {
      if (focusIndex > -1) {
        break;
      }
    }
  }

  return focusIndex;
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
