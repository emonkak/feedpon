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

export interface VirtualScroller
  extends Component<VirtualScrollerProps<any, any, any>> {
  <TSource, TKey, TElement>(
    props: VirtualScrollerProps<TSource, TKey, TElement>,
  ): Bindable<VirtualScrollerProps<TSource, TKey, TElement>>;
}

export interface VirtualScrollerProps<TSource, TKey, TElement> {
  assumedItemHeight: number;
  delay?: number;
  elementSelector: (
    item: TSource,
    index: number,
    context: RenderContext,
  ) => TElement;
  keySelector?: (item: TSource, index: number) => TKey;
  offscreenRatio?: number;
  onVisibleRangeChange?: (range: VisibleRange) => void;
  ref?: Ref<VirtualScrollerHandle<TKey>>;
  scrollMargin?: string;
  source: TSource[];
}

export interface VirtualScrollerHandle<TKey> {
  getMeasuredItems(): readonly MeasuredItem<TKey>[];
  getVisibleElement(index: number): Element | undefined;
  getVisibleElements(): Element[];
  getVisibleRange(): VisibleRange;
  scrollToIndex(index: number): Promise<void>;
}

export interface MeasuredItem<TKey> {
  readonly key: TKey;
  readonly height: number;
}

// A (half-open) range bounded inclusively below and exclusively above.
export interface VisibleRange {
  readonly start: number;
  readonly end: number;
}

export const VirtualScroller: VirtualScroller = createComponent(
  function VirtualScroller<TSource, TKey, TElement>(
    {
      assumedItemHeight,
      delay,
      elementSelector,
      keySelector = (_item, index) => index as TKey,
      offscreenRatio = 1,
      onVisibleRangeChange,
      ref,
      scrollMargin,
      source,
    }: VirtualScrollerProps<TSource, TKey, TElement>,
    $: RenderContext,
  ): unknown {
    const [visibleRange, setVisibleRange] = $.useState<VisibleRange>({
      start: 0,
      end: 0,
    });
    const { measuredItems, visibleElements } = $.useMemo(
      () => ({
        measuredItems: [] as MeasuredItem<TKey>[],
        visibleElements: new Map<number, Element>(),
      }),
      [],
    );

    const getMeasuredHeight = (item: TSource, index: number): number => {
      const measuredItem = measuredItems[index];
      return measuredItem !== undefined &&
        Object.is(measuredItem.key, keySelector(item, index))
        ? measuredItem.height
        : assumedItemHeight;
    };

    const computeRangeHeight = (start: number, end: number): number => {
      let height = 0;
      for (let i = start; i < end; i++) {
        height += getMeasuredHeight(source[i]!, i);
      }
      return height;
    };

    const computeVisibleRange = (top: number, bottom: number): VisibleRange => {
      const size = source.length;
      let start = 0;
      let y = 0;

      // Skip head items.
      for (let i = start; i < size; i++) {
        const height = getMeasuredHeight(source[i]!, i);
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
        y += getMeasuredHeight(source[i]!, i);
        end = i + 1;
      }

      return {
        start,
        end,
      };
    };

    const intersectionObserver = $.use(
      IntersectionObserver(
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
              onVisibleRangeChange?.(visibleRange);
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
      ResizeObserver((entries) => {
        for (const entry of entries) {
          if (!entry.target.isConnected) {
            continue;
          }

          const index = Number(entry.target.getAttribute('aria-posinset')!) - 1;
          const item = source[index];

          if (item !== undefined) {
            const key = keySelector(item, index);
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
        getMeasuredItems(): readonly MeasuredItem<TKey>[] {
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
          return visibleRange;
        },
        async scrollToIndex(
          index: number,
          options?: ScrollIntoViewOptions,
        ): Promise<void> {
          if (!withinRange(visibleRange, index)) {
            const visibleRange = {
              start: index,
              end: index + 1,
            };
            intersectionObserver.disconnect();
            await setVisibleRange(visibleRange).finished;
            onVisibleRangeChange?.(visibleRange);
          }

          visibleElements.get(index)?.scrollIntoView(options);
        },
      })),
    );

    $.useLayoutEffect(() => {
      for (let i = 0, l = source.length; i < l; i++) {
        const measuredItem = measuredItems[i];
        const key = keySelector(source[i]!, i);

        if (measuredItem === undefined || !Object.is(measuredItem.key, key)) {
          measuredItems[i] = {
            key,
            height: assumedItemHeight,
          };
        }
      }

      measuredItems.length = source.length;
    }, [source]);

    const headSpace = computeRangeHeight(0, visibleRange.start);
    const tailSpace = computeRangeHeight(visibleRange.end, source.length);

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
            elementSelector: (item, offset) => {
              const index = visibleRange.start + offset;
              return $.html`
                <li
                  :ref=${itemRef}
                  aria-posinset=${index + 1}
                  aria-setsize=${source.length}
                  class="VirtualScroller-item"
                >
                  <${elementSelector(item, index, $)}>
                </li>
              `;
            },
            keySelector: (item, offset) =>
              keySelector(item, visibleRange.start + offset),
            source: source.slice(visibleRange.start, visibleRange.end),
          })}>
        </ul>
        <${Keyed(tailSpacer, tailSpace)}>
      </div>
    `;
  },
);

function IntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
): HookFunction<IntersectionObserver> {
  return (context) => {
    const onEntries = context.use(EffectEvent(callback));
    return context.useMemo(
      () => new window.IntersectionObserver(onEntries, options),
      [],
    );
  };
}

function ResizeObserver(
  callback: ResizeObserverCallback,
): HookFunction<ResizeObserver> {
  return (context) => {
    const onEntries = context.use(EffectEvent(callback));
    return context.useMemo(() => new window.ResizeObserver(onEntries), []);
  };
}

function areRangesEqual(x: VisibleRange, y: VisibleRange) {
  return x.start === y.start && x.end === y.end;
}

function withinRange(range: VisibleRange, index: number): boolean {
  return range.start <= index && index < range.end;
}
