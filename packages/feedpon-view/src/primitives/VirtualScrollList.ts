import {
  type Bindable,
  type Component,
  type CustomHookFunction,
  createComponent,
  type Ref,
  type RefCallback,
  type RefObject,
  type RenderContext,
  Repeat,
} from 'barebind';
import { createEventHook } from '../primitives/hooks/eventHook.ts';
import { isMountedHook } from '../primitives/hooks/isMountedHook.ts';
import { createPreviousHook } from '../primitives/hooks/previousHook.ts';
import { throttle } from './utils/throttle.ts';

export interface BlankSpaces {
  above: number;
  below: number;
}

export interface BlockPosition {
  start: number;
  end: number;
}

export type BlockSizes = Map<PropertyKey, number>;

export interface Dimensions {
  blockPositions: BlockPosition[];
  blockSizes: BlockSizes;
  scope: Scope;
  screen: DOMRectReadOnly;
}

export interface Scope {
  end: number;
  start: number;
}

export interface VirtualScrollListRef {
  scrollTo(index: number): void;
}

export interface VirtualScrollListProps<
  TItem extends { id: PropertyKey } = any,
> {
  assumedItemSize?: number;
  getScrollContainer?: () => Window | Element;
  getScreen?: () => DOMRectReadOnly;
  initialItemIndex?: number;
  items: TItem[];
  offscreenRatio?: number;
  onUpdateBlockSizes?: (newBlockSizes: BlockSizes) => void;
  onUpdateDimensions?: (dimensions: Dimensions) => void;
  ref?: RefObject<VirtualScrollListRef | null>;
  renderItem: (
    item: TItem,
    index: number,
    ref: Ref<Element>,
    context: RenderContext,
  ) => unknown;
  renderList: (
    children: unknown,
    blankSpaces: BlankSpaces,
    ref: Ref<Element>,
    context: RenderContext,
  ) => unknown;
  scheduleUpdate?: (callback: VoidFunction) => void;
  scrollBy?: (x: number, y: number) => void;
  scrollThrottleTime?: number;
}

export interface VirtualScrollList extends Component<VirtualScrollListProps> {
  <TItem extends { id: PropertyKey }>(
    props: VirtualScrollListProps<TItem>,
  ): Bindable<VirtualScrollListProps<TItem>>;
}

export const VirtualScrollList: VirtualScrollList = createComponent(
  function VirtualScrollList<TItem extends { id: PropertyKey }>(
    {
      assumedItemSize = 200,
      getScrollContainer = () => window,
      getScreen = () =>
        new DOMRect(0, 0, window.innerWidth, window.innerHeight),
      initialItemIndex = -1,
      items,
      offscreenRatio = 1.0,
      onUpdateBlockSizes,
      onUpdateDimensions,
      ref = { current: null },
      renderItem,
      renderList,
      scheduleUpdate = queueMicrotask,
      scrollBy = (x, y) => window.scrollBy(x, y),
      scrollThrottleTime = 100,
    }: VirtualScrollListProps<TItem>,
    $: RenderContext,
  ): unknown {
    const containerRef = $.useRef<Element | null>(null);
    const scrollingItemIndexRef = $.useRef(initialItemIndex);
    const blockSizesRef = $.useMemo(() => ({ current: new Map() }), []);
    const isDirtyRef = $.useRef(false);
    const blockPositionsRef = $.useMemo(
      () => ({
        current: computeBlockPositions(
          items,
          blockSizesRef.current,
          assumedItemSize,
        ),
      }),
      [],
    );
    const scopeRef = $.useMemo(
      () => ({
        current: getInitialScope(
          items,
          blockSizesRef.current,
          assumedItemSize,
          initialItemIndex,
          getScreen(),
        ),
      }),
      [],
    );

    const oldItems = $.use(createPreviousHook(items)) ?? [];
    if (items !== oldItems) {
      const newSlice = items.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );
      const oldSlice = oldItems.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );

      if (areItemsIdentical(newSlice, oldSlice)) {
        if (items.length > scopeRef.current.end) {
          scopeRef.current = {
            start: Math.min(items.length - 1, scopeRef.current.start),
            end: items.length,
          };
        }
      } else {
        scrollingItemIndexRef.current = initialItemIndex;
        scopeRef.current = getInitialScope(
          items,
          blockSizesRef.current,
          assumedItemSize,
          initialItemIndex,
          getScreen(),
        );
      }

      blockPositionsRef.current = computeBlockPositions(
        items,
        blockSizesRef.current,
        assumedItemSize,
      );
    }

    ref.current = {
      scrollTo(index: number): void {
        scopeRef.current = getInitialScope(
          items,
          blockSizesRef.current,
          assumedItemSize,
          index,
          getScreen(),
        );

        scrollingItemIndexRef.current = index;

        // Force update even if the scope has not changed.
        $.forceUpdate();
      },
    };

    const isMounted = $.use(isMountedHook);

    const updateDimensions = $.useCallback(() => {
      if (!isMounted()) {
        requestAnimationFrame(updateDimensions);
        return;
      }

      const screen = containerRef.current
        ? translateRect(
            getScreen(),
            containerRef.current.getBoundingClientRect(),
          )
        : getScreen();

      const newScope = getCurrentScope(
        blockPositionsRef.current,
        screen,
        offscreenRatio,
      );

      if (!areScopesEqual(scopeRef.current, newScope)) {
        scopeRef.current = newScope;
        $.forceUpdate();
      }

      onUpdateDimensions?.({
        blockPositions: blockPositionsRef.current,
        blockSizes: blockSizesRef.current,
        scope: newScope,
        screen,
      });

      isDirtyRef.current = false;
    }, [onUpdateDimensions]);

    $.useEffect(() => {
      const scrollContainer = getScrollContainer();

      const callback = throttle(() => {
        if (!isDirtyRef.current) {
          scheduleUpdate(updateDimensions);
          isDirtyRef.current = true;
        }
      }, scrollThrottleTime);

      scrollContainer.addEventListener('scroll', callback, {
        passive: true,
      });

      return () => {
        scrollContainer.removeEventListener('scroll', callback);
      };
    }, [
      getScrollContainer,
      scheduleUpdate,
      scrollThrottleTime,
      updateDimensions,
    ]);

    $.useEffect(() => {
      let shouldUpdate = false;

      const newSlice = items.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );
      const oldSlice = oldItems.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );

      if (!areItemsIdentical(newSlice, oldSlice)) {
        blockPositionsRef.current = computeBlockPositions(
          items,
          blockSizesRef.current,
          assumedItemSize,
        );
        shouldUpdate = true;
      }

      if (scrollingItemIndexRef.current >= 0) {
        const screen = containerRef.current
          ? translateRect(
              getScreen(),
              containerRef.current.getBoundingClientRect(),
            )
          : getScreen();

        const scrollOffset = getScrollOffset(
          blockPositionsRef.current,
          scrollingItemIndexRef.current,
          screen,
        );

        if (scrollOffset !== 0) {
          scrollBy(0, scrollOffset);
        }

        scrollingItemIndexRef.current = -1;
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        if (!isDirtyRef.current) {
          scheduleUpdate(updateDimensions);
          isDirtyRef.current = true;
        }
      }
    }, [items, scrollingItemIndexRef.current, scopeRef.current]);

    const elementToIdMap = $.useMemo(
      () => new WeakMap<Element, TItem['id']>(),
      [],
    );

    const handleResizeObserverEntries = $.use(
      createEventHook((entries: ResizeObserverEntry[]) => {
        const blockSizes = blockSizesRef.current;
        let hasChanged = false;

        for (let i = 0, l = entries.length; i < l; i++) {
          const entry = entries[i]!;
          if (!entry.target.isConnected) {
            continue;
          }
          const id = elementToIdMap.get(entry.target);
          if (id !== undefined) {
            const oldBlockSize = blockSizes.get(id);
            const newBlockSize = entry.borderBoxSize[0]!.blockSize;
            if (oldBlockSize !== newBlockSize) {
              blockSizes.set(id, newBlockSize);
              hasChanged = true;
            }
          }
        }

        if (!hasChanged) {
          return;
        }

        blockPositionsRef.current = computeBlockPositions(
          items,
          blockSizesRef.current,
          assumedItemSize,
        );
        if (!isDirtyRef.current) {
          scheduleUpdate(updateDimensions);
          isDirtyRef.current = true;
        }
        onUpdateBlockSizes?.(blockSizesRef.current);
      }),
    );
    const resizeObserver = $.use(
      createResizeObserverHook(handleResizeObserverEntries),
    );

    const children = $.useMemo(
      () =>
        Repeat({
          source: items.slice(scopeRef.current.start, scopeRef.current.end),
          keySelector: (item) => item.id,
          valueSelector: (item, index) => {
            const id = item.id;
            const ref: RefCallback<Element> = (element) => {
              elementToIdMap.set(element, id);
              resizeObserver.observe(element);
              return () => {
                elementToIdMap.delete(element);
                resizeObserver.unobserve(element);
              };
            };
            return renderItem(item, index + scopeRef.current.start, ref, $);
          },
        }),
      [items, renderItem, scopeRef.current],
    );

    const blankSpaces = getBlankSpaces(
      blockPositionsRef.current,
      scopeRef.current,
    );

    return renderList(children, blankSpaces, containerRef, $);
  },
);

function areItemsIdentical<T extends { id: PropertyKey }>(
  first: readonly T[],
  second: readonly T[],
): boolean {
  if (first === second) {
    return true;
  }

  if (first.length !== second.length) {
    return false;
  }

  for (let i = 0, l = first.length; i < l; i++) {
    if (first[i]!.id !== second[i]!.id) {
      return false;
    }
  }

  return true;
}

function areScopesEqual(first: Scope, second: Scope) {
  return first.start === second.start && first.end === second.end;
}

function computeBlockPositions<TItem extends { id: PropertyKey }>(
  items: TItem[],
  blockSizes: BlockSizes,
  assumedItemSize: number,
): BlockPosition[] {
  const blockPositions = new Array(items.length);

  for (let start = 0, i = 0, l = items.length; i < l; i++) {
    const item = items[i]!;
    const id = item.id as TItem['id'];
    const size = blockSizes.get(id) ?? assumedItemSize;
    const blockPosition = { start, end: start + size };
    start = blockPosition.end;
    blockPositions[i] = blockPosition;
  }

  return blockPositions;
}

function createResizeObserverHook(
  callback: ResizeObserverCallback,
): CustomHookFunction<ResizeObserver> {
  return (context) => {
    const resizeObserver = context.useMemo(
      () => new ResizeObserver(callback),
      [callback],
    );

    context.useEffect(() => {
      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    return resizeObserver;
  };
}

function getBlankSpaces(
  blockPositions: BlockPosition[],
  scope: Scope,
): BlankSpaces {
  if (blockPositions.length === 0) {
    return {
      above: 0,
      below: 0,
    };
  }

  const above =
    scope.start < blockPositions.length
      ? blockPositions[scope.start]!.start
      : blockPositions[blockPositions.length - 1]!.end;
  const below =
    scope.end < blockPositions.length
      ? blockPositions[blockPositions.length - 1]!.end -
        blockPositions[scope.end]!.start
      : 0;

  return {
    above,
    below,
  };
}

function getCurrentScope(
  blockPositions: BlockPosition[],
  screen: DOMRectReadOnly,
  offscreenRatio: number,
): Scope {
  if (blockPositions.length === 0) {
    return {
      start: 0,
      end: 0,
    };
  }

  const offscreenHeight = screen.height * offscreenRatio;
  const startPosition = screen.top - offscreenHeight;
  const endPosition = screen.bottom + offscreenHeight;

  const size = blockPositions.length;
  let start = 0;

  for (let i = 0; i < size; i++) {
    const blockPosition = blockPositions[start]!;
    if (blockPosition.end > startPosition) {
      break;
    }
    start = i;
  }

  let end = start + 1;

  for (let i = end; i < size; i++) {
    const blockPosition = blockPositions[end]!;
    if (blockPosition.start >= endPosition) {
      break;
    }
    end = i + 1;
  }

  return {
    start,
    end,
  };
}

function getInitialScope<TItem extends { id: PropertyKey }>(
  items: TItem[],
  blockSizes: BlockSizes,
  assumedItemSize: number,
  initialItemIndex: number,
  screen: DOMRectReadOnly,
): Scope {
  const screenHeight = screen.bottom - screen.top;

  const start = Math.max(0, initialItemIndex);
  let end = start;

  for (
    let l = items.length, remainingSpace = screenHeight;
    end < l && remainingSpace > 0;
    end++
  ) {
    const item = items[end]!;
    const id = item.id as TItem['id'];
    const size = blockSizes.get(id) ?? assumedItemSize;
    remainingSpace -= size;
  }

  return {
    start,
    end,
  };
}

function getScrollOffset(
  blockPositions: BlockPosition[],
  index: number,
  screen: DOMRectReadOnly,
): number {
  if (index < 0 || blockPositions.length === 0) {
    return 0;
  }

  return index >= blockPositions.length
    ? blockPositions[blockPositions.length - 1]!.end - screen.top
    : blockPositions[index]!.start - screen.top;
}

function translateRect(
  rect: DOMRectReadOnly,
  referenceRect: DOMRectReadOnly,
): DOMRectReadOnly {
  const top = rect.top - referenceRect.top;
  const left = rect.left - referenceRect.left;
  return new DOMRect(left, top, rect.width, rect.height);
}
