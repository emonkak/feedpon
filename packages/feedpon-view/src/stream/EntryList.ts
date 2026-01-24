import { createComponent, type RefObject, type RenderContext } from 'barebind';
import { EventCallback } from 'barebind/addons/hooks';
import type { Entry, Session, Stream } from 'feedpon-store';
import { throttle } from '../primitives/utils/throttle.ts';
import {
  type Range,
  VirtualScroller,
  type VirtualScrollerHandle,
} from '../primitives/VirtualScroller.ts';
import { EntryView } from './EntryView.ts';

export interface EntryListProps {
  isStreamLoading: boolean;
  onEntryExpand: (index: number) => void;
  onEntryFocus: (index: number) => void;
  onFullContentsFetch: (entryId: string) => Promise<void>;
  onFullContentsToggle: (entryId: string, shown: boolean) => void;
  onHatenaBookmarkEntryFetch: (entryId: string) => Promise<void>;
  onHatenaBookmarkEntryToggle: (entryId: string, shown: boolean) => void;
  scrollDuration: number;
  session: Session;
  stream: Stream | null;
  virtualScrollerRef: RefObject<VirtualScrollerHandle | null>;
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
    virtualScrollerRef,
    session,
    scrollDuration,
    stream,
  }: EntryListProps,
  $: RenderContext,
): unknown {
  const scrollCallback = $.use(
    EventCallback(() => {
      const virtualScroller = virtualScrollerRef.current;
      if (virtualScroller === null) {
        return;
      }

      const visibleElements = virtualScroller.getVisibleElements();
      const visibleRange = virtualScroller.getVisibleRange();
      const focusIndex = getFocusIndex(visibleElements, visibleRange);

      if (focusIndex !== session.focusIndex) {
        onEntryFocus(focusIndex);
      }
    }),
  );
  const throttledScrollCallback = $.useMemo(
    () => throttle(scrollCallback, scrollDuration),
    [],
  );

  $.useLayoutEffect(() => {
    window.addEventListener('scroll', throttledScrollCallback, {
      passive: true,
    });
    return () => {
      window.removeEventListener('scroll', throttledScrollCallback);
    };
  }, []);

  $.useLayoutEffect(() => {
    throttledScrollCallback();
  }, [stream]);

  $.useLayoutEffect(() => {
    if (session.expandedIndex >= 0) {
      virtualScrollerRef.current!.scrollToIndex(session.expandedIndex);
    }
  }, [session.expandedIndex]);

  $.useLayoutEffect(() => {
    if (session.expandedIndex < 0 && session.focusIndex >= 0) {
      const virtualScroller = virtualScrollerRef.current!;
      const element = virtualScroller.getVisibleElement(session.focusIndex);
      if (element === undefined || !isInViewport(element)) {
        virtualScroller.scrollToIndex(session.focusIndex);
      }
    }
  }, [session.focusIndex]);

  if (isStreamLoading && stream === null) {
    if (session.settings.layout === 'full') {
      return $.html`
        <div class="stream-body">
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
          <${FullEntryPlaceholder({})}>
        </div>
      `;
    } else {
      return $.html`
        <div class="stream-body">
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

  const virtualScroller = VirtualScroller({
    assumedItemHeight: session.settings.layout === 'full' ? 800 : 100,
    delay: scrollDuration,
    onVisibleRangeChange: throttledScrollCallback,
    items: stream?.items ?? [],
    ref: virtualScrollerRef,
    scrollMargin: '2rlh 0 0',
    renderItem: (entry: Entry, index: number) => {
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
      });
    },
  });

  return $.html`
    <div class="stream-body">
      <${virtualScroller}>
    </div>
  `;
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

function getFocusIndex(
  visibleElements: Element[],
  visibleRange: Range,
): number {
  const viewportTop = 0;
  const viewportBottom = window.innerHeight;

  let maxVisibleHeight = 0;
  let mostVisibleIndex = -1;
  let traversedIndex = -1;

  for (let i = 0, l = visibleElements.length; i < l; i++) {
    const el = visibleElements[i]!;
    const style = window.getComputedStyle(el);
    const { top, bottom, height } = el.getBoundingClientRect();

    const scrollMarginTop = parseFloat(style.scrollMarginTop) ?? 0;
    const scrollMarginBottom = parseFloat(style.scrollMarginBottom) ?? 0;
    const scrollTop = viewportTop + scrollMarginTop;
    const scrollBottom = viewportBottom - scrollMarginBottom;

    const visibleTop = Math.max(top, scrollTop);
    const visibleBottom = Math.min(bottom, scrollBottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    if (visibleHeight >= 1 && visibleHeight > maxVisibleHeight) {
      maxVisibleHeight = visibleHeight;
      mostVisibleIndex = i;
    }

    if (Math.abs(visibleHeight - height) < 1) {
      break;
    }

    traversedIndex = i;
  }

  if (mostVisibleIndex >= 0) {
    return visibleRange.start + mostVisibleIndex;
  }

  if (traversedIndex >= 0) {
    return visibleRange.end;
  }

  return -1;
}

function isInViewport(el: Element): boolean {
  const { bottom, right, top, left } = el.getBoundingClientRect();

  return (
    bottom > 0 &&
    right > 0 &&
    top < window.innerHeight &&
    left < window.innerWidth
  );
}
