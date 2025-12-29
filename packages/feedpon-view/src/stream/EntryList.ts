import {
  createComponent,
  Keyed,
  type RefObject,
  type RenderContext,
} from 'barebind';
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
      const visibleElements = virtualScrollerRef.current!.getVisibleElements();
      const visibleRange = virtualScrollerRef.current!.getVisibleRange();
      const focusIndex = getFocusIndex(visibleElements, visibleRange);

      if (session !== null && focusIndex !== session.focusIndex) {
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
    scrollCallback();
  }, [stream]);

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

  const virtualScroller = Keyed(
    session.settings.layout,
    VirtualScroller({
      assumedItemHeight: session.settings.layout === 'full' ? 800 : 100,
      delay: scrollDuration,
      initialItemIndex:
        session.expandedIndex >= 0
          ? session.expandedIndex
          : session.focusIndex >= 0
            ? session.focusIndex
            : 0,
      onVisibleRangeChange: throttledScrollCallback,
      source: stream?.items ?? [],
      ref: virtualScrollerRef,
      scrollMargin: '2rlh 0 0',
      renderItem: (entry: Entry, index: number) => {
        return EntryView({
          entry,
          index,
          isSelected: index === session.focusIndex,
          isExpanded:
            session.settings.layout === 'full' ||
            index === session.expandedIndex,
          onEntryExpand,
          onFullContentsFetch,
          onFullContentsToggle,
          onHatenaBookmarkEntryFetch,
          onHatenaBookmarkEntryToggle,
        });
      },
    }),
  );

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

function getFocusIndex(elements: Element[], visibleRange: Range): number {
  const viewportTop = 0;
  const viewportBottom = window.innerHeight;

  let maxVisibleHeight = 0;
  let mostVisibleIndex = -1;
  let traversedIndex = -1;

  for (let i = 0, l = elements.length; i < l; i++) {
    const el = elements[i]!;
    const style = window.getComputedStyle(el);
    const { top, bottom, height } = el.getBoundingClientRect();

    const minTop = viewportTop + (parseFloat(style.scrollMarginTop) ?? 0);
    const maxBottom = viewportBottom - (parseFloat(style.scrollMarginTop) ?? 0);

    if (top > maxBottom) {
      break;
    }

    const visibleTop = Math.max(top, minTop);
    const visibleBottom = Math.min(bottom, maxBottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    if (visibleHeight > maxVisibleHeight) {
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
