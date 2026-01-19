import {
  type Bindable,
  type Component,
  createComponent,
  type HookFunction,
  Keyed,
  type Ref,
  type RenderContext,
  Repeat,
} from 'barebind';
import { EffectEvent, ImperativeHandle } from 'barebind/addons/hooks';

export interface VirtualScroller extends Component<VirtualScrollerProps<any>> {
  <T>(props: VirtualScrollerProps<T>): Bindable<VirtualScrollerProps<T>>;
}

export interface VirtualScrollerProps<T> {
  assumedItemHeight: number;
  delay?: number;
  getItemKey?: (item: T, index: number) => unknown;
  items: T[];
  offscreenRatio?: number;
  onVisibleRangeChange?: () => void;
  ref?: Ref<VirtualScrollerHandle>;
  renderItem: (item: T, index: number, context: RenderContext) => unknown;
  scrollMargin?: string;
}

export interface VirtualScrollerHandle {
  getMeasuredItems(): readonly MeasuredItem[];
  getVisibleElement(index: number): Element | undefined;
  getVisibleElements(): Element[];
  getVisibleRange(): VisibleRange;
  scrollToIndex(index: number): void;
}

export interface MeasuredItem {
  key: unknown;
  height: number;
}

// A (half-open) range bounded inclusively below and exclusively above.
export interface VisibleRange {
  start: number;
  end: number;
}

export const VirtualScroller: VirtualScroller = createComponent(
  function VirtualScroller<T>(
    {
      assumedItemHeight,
      delay,
      getItemKey = (_item, index) => index,
      onVisibleRangeChange,
      offscreenRatio = 1,
      ref,
      renderItem,
      scrollMargin,
      items,
    }: VirtualScrollerProps<T>,
    $: RenderContext,
  ): unknown {
    const [visibleRange, setVisibleRange] = $.useState<VisibleRange>({
      start: 0,
      end: 0,
    });
    const { measuredItems, visibleElements } = $.useMemo(
      () => ({
        measuredItems: [] as MeasuredItem[],
        visibleElements: new Map<number, Element>(),
      }),
      [],
    );

    const getItemHeight = (item: T, index: number): number => {
      const measuredItem = measuredItems[index];
      return measuredItem !== undefined &&
        Object.is(measuredItem.key, getItemKey(item, index))
        ? measuredItem.height
        : assumedItemHeight;
    };

    const computeRangeHeight = (
      start: number,
      end: number = items.length,
    ): number => {
      let height = 0;
      for (let i = start; i < end; i++) {
        height += getItemHeight(items[i]!, i);
      }
      return height;
    };

    const computeVisibleRange = (top: number, bottom: number): VisibleRange => {
      const size = items.length;
      let start = 0;
      let y = 0;

      // Skip head items.
      for (let i = start; i < size; i++) {
        const height = getItemHeight(items[i]!, i);
        if (y + height >= top) {
          break;
        }
        start = i + 1;
        y += height;
      }

      let end = start;

      // Take tail items.
      for (let i = start; i < size; i++) {
        if (y > bottom) {
          break;
        }
        y += getItemHeight(items[i]!, i);
        end = i + 1;
      }

      return {
        start,
        end,
      };
    };

    const intersectionObserver = $.use(
      NewIntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting || !entry.target.isConnected) {
              continue;
            }

            const top =
              -entry.target.parentElement!.getBoundingClientRect().top +
              entry.rootBounds!.top;
            const bottom = top + entry.rootBounds!.height;
            const visibleRange = computeVisibleRange(top, bottom);

            setVisibleRange(visibleRange, {
              areStatesEqual: areRangesEqual,
            }).finished.then(() => {
              onVisibleRangeChange?.();
            });
          }
        },
        {
          rootMargin: offscreenRatio * 100 + '%',
          delay,
        } as IntersectionObserverInit & { delay?: number },
      ),
    );

    const resizeObserver = $.use(
      NewResizeObsever((entries) => {
        for (const entry of entries) {
          if (!entry.target.isConnected) {
            continue;
          }

          const index = Number(entry.target.getAttribute('aria-posinset')!) - 1;
          const item = items[index];

          if (item !== undefined) {
            const key = getItemKey(item, index);
            measuredItems[index] = {
              key,
              height: entry.contentRect.height,
            };
          }
        }
      }),
    );

    const spacerRef = $.useCallback((element: Element) => {
      intersectionObserver.observe(element);
      return () => {
        intersectionObserver.unobserve(element);
      };
    }, []);

    const itemRef = $.useCallback((element: Element) => {
      const index = Number(element.getAttribute('aria-posinset')) - 1;
      visibleElements.set(index, element);
      resizeObserver.observe(element);
      return () => {
        visibleElements.delete(index);
        resizeObserver.unobserve(element);
      };
    }, []);

    $.use(
      ImperativeHandle(ref, () => ({
        getMeasuredItems(): readonly MeasuredItem[] {
          return measuredItems;
        },
        getVisibleElement(index: number): Element | undefined {
          return visibleElements.get(index);
        },
        getVisibleElements(): Element[] {
          return visibleElements
            .entries()
            .toArray()
            .sort((x, y) => x[0] - y[0])
            .map((x) => x[1]);
        },
        getVisibleRange(): VisibleRange {
          return structuredClone(visibleRange);
        },
        async scrollToIndex(
          index: number,
          options?: ScrollIntoViewOptions,
        ): Promise<void> {
          if (!withinRange(visibleRange, index)) {
            intersectionObserver.disconnect();

            await setVisibleRange({
              start: index,
              end: index + 1,
            }).finished;

            onVisibleRangeChange?.();
          }
          visibleElements.get(index)?.scrollIntoView(options);
        },
      })),
    );

    $.useLayoutEffect(() => {
      for (let i = 0, l = items.length; i < l; i++) {
        const measuredItem = measuredItems[i];
        const key = getItemKey(items[i]!, i);

        if (measuredItem === undefined || !Object.is(measuredItem.key, key)) {
          measuredItems[i] = {
            key,
            height: assumedItemHeight,
          };
        }
      }

      measuredItems.length = items.length;
    }, [items]);

    const headSpace = computeRangeHeight(0, visibleRange.start);
    const tailSpace = computeRangeHeight(visibleRange.end);

    const headSpacer =
      headSpace > 0
        ? $.html`
          <div
            :ref=${spacerRef}
            :style=${{ height: headSpace + 'px' }}
            class="VirtualScroller-spacer"
          ></div>
        `
        : null;
    const tailSpacer =
      tailSpace > 0
        ? $.html`
          <div
            :ref=${spacerRef}
            :style=${{ height: tailSpace + 'px' }}
            class="VirtualScroller-spacer"
          ></div>
        `
        : null;

    return $.html`
      <div class="VirtualScroller" :style=${{ scrollMargin }}>
        <${Keyed(headSpacer, headSpace)}>
        <ul class="VirtualScroller-list">
          <${Repeat({
            items: items.slice(visibleRange.start, visibleRange.end),
            keySelector: (item, offset) =>
              getItemKey(item, visibleRange.start + offset),
            valueSelector: (item, offset) => {
              const index = visibleRange.start + offset;
              return $.html`
                <li
                  :ref=${itemRef}
                  aria-posinset=${index + 1}
                  aria-setsize=${items.length}
                  class="VirtualScroller-item"
                >
                  <${renderItem(item, index, $)}>
                </li>
              `;
            },
          })}>
        </ul>
        <${Keyed(tailSpacer, tailSpace)}>
      </div>
    `;
  },
);

function NewIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): HookFunction<IntersectionObserver> {
  return ($) => {
    const eventCallback = $.use(EffectEvent(callback));
    return $.useMemo(
      () => new IntersectionObserver(eventCallback, options),
      [],
    );
  };
}

function NewResizeObsever(
  callback: ResizeObserverCallback,
): HookFunction<ResizeObserver> {
  return ($) => {
    const eventCallback = $.use(EffectEvent(callback));
    return $.useMemo(() => new ResizeObserver(eventCallback), []);
  };
}

function areRangesEqual(x: VisibleRange, y: VisibleRange) {
  return x.start === y.start && x.end === y.end;
}

function withinRange(range: VisibleRange, index: number): boolean {
  return range.start <= index && index < range.end;
}
