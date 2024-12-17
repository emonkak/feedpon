import type {
  RefObject,
  RenderContext,
  TemplateResult,
  Usable,
} from '@emonkak/ebit';
import { keyedList, memo } from '@emonkak/ebit/directives.js';
import throttle from 'feedpon-utils/throttle';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { RefCallback } from '@emonkak/ebit';
import type { ElementRef, List, Memo } from '@emonkak/ebit/directives.js';
import { createEventHook } from '../hooks/eventHook';
import { isMountedHook } from '../hooks/isMountedHook';
import { createPreviousHook } from '../hooks/previousHook';
import { useEvent } from '../hooks/useEvent';
import { useIsMounted } from '../hooks/useIsMounted';
import { usePrevious } from '../hooks/usePrevious';

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
  TItem extends { id: PropertyKey },
  TValue,
> {
  assumedItemSize?: number;
  getScrollContainer?: () => Window | Element;
  getScreen?: () => DOMRectReadOnly;
  initialItemIndex?: number;
  items: TItem[];
  offscreenRatio?: number;
  onUpdateBlockSizes?: (newBlockSizes: BlockSizes) => void;
  onUpdateDimensions?: (dimensions: Dimensions) => void;
  ref: RefObject<VirtualScrollListRef | null>;
  renderItem: (
    item: TItem,
    index: number,
    ref: ElementRef,
    context: RenderContext,
  ) => TValue;
  renderList: (
    children: Memo<List<TItem, TItem['id'], TValue>>,
    blankSpaces: BlankSpaces,
    ref: ElementRef,
    context: RenderContext,
  ) => TemplateResult;
  scheduleUpdate?: (callback: VoidFunction) => void;
  scrollBy?: (x: number, y: number) => void;
  scrollThrottleTime?: number;
}

export function VirtualScrollList<TItem extends { id: PropertyKey }, TValue>(
  {
    assumedItemSize = 200,
    getScrollContainer = () => window,
    getScreen = () => new DOMRect(0, 0, window.innerWidth, window.innerHeight),
    initialItemIndex = -1,
    items,
    offscreenRatio = 1.0,
    onUpdateBlockSizes,
    onUpdateDimensions,
    ref,
    renderItem,
    renderList,
    scheduleUpdate = queueMicrotask,
    scrollBy = (x, y) => window.scrollBy(x, y),
    scrollThrottleTime = 100,
  }: VirtualScrollListProps<TItem, TValue>,
  context: RenderContext,
): TemplateResult {
  const containerRef = context.useRef<Element | null>(null);
  const scrollingItemIndexRef = context.useRef(initialItemIndex);
  const blockSizesRef = context.useMemo(() => ({ current: new Map() }), []);
  const isDirtyRef = context.useRef(false);
  const blockPositionsRef = context.useMemo(
    () => ({
      current: computeBlockPositions(
        items,
        blockSizesRef.current,
        assumedItemSize,
      ),
    }),
    [],
  );
  const scopeRef = context.useMemo(
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

  const oldItems = context.use(createPreviousHook(items)) ?? [];
  if (items !== oldItems) {
    const newSlice = items.slice(scopeRef.current.start, scopeRef.current.end);
    const oldSlice = oldItems.slice(
      scopeRef.current.start,
      scopeRef.current.end,
    );

    if (areIdenticalItems(newSlice, oldSlice)) {
      if (items.length < scopeRef.current.end) {
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

  const [, forceUpdate] = context.useState({});

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
      forceUpdate({});
    },
  };

  const isMounted = context.use(isMountedHook);

  const updateDimensions = context.useCallback(() => {
    if (!isMounted()) {
      requestAnimationFrame(updateDimensions);
      return;
    }

    const screen = containerRef.current
      ? translateRect(getScreen(), containerRef.current.getBoundingClientRect())
      : getScreen();

    const newScope = getCurrentScope(
      blockPositionsRef.current,
      screen,
      offscreenRatio,
    );

    if (!areEqualScopes(scopeRef.current, newScope)) {
      scopeRef.current = newScope;
      forceUpdate({});
    }

    onUpdateDimensions?.({
      blockPositions: blockPositionsRef.current,
      blockSizes: blockSizesRef.current,
      scope: newScope,
      screen,
    });

    isDirtyRef.current = false;
  }, [onUpdateDimensions]);

  context.useEffect(() => {
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

  context.useEffect(() => {
    let willUpdate = false;

    const newSlice = items.slice(scopeRef.current.start, scopeRef.current.end);
    const oldSlice = oldItems.slice(
      scopeRef.current.start,
      scopeRef.current.end,
    );

    if (!areIdenticalItems(newSlice, oldSlice)) {
      blockPositionsRef.current = computeBlockPositions(
        items,
        blockSizesRef.current,
        assumedItemSize,
      );
      willUpdate = true;
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
      willUpdate = true;
    }

    if (willUpdate) {
      if (!isDirtyRef.current) {
        scheduleUpdate(updateDimensions);
        isDirtyRef.current = true;
      }
    }
  }, [items, scrollingItemIndexRef.current, scopeRef.current]);

  const elementToIdMap = context.useMemo(
    () => new WeakMap<Element, TItem['id']>(),
    [],
  );

  const handleResizeObserverEntries = context.use(
    createEventHook((entries: ResizeObserverEntry[]) => {
      const blockSizes = blockSizesRef.current;
      let hasChanged = false;

      for (let i = 0, l = entries.length; i < l; i++) {
        const entry = entries[i]!;
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
  const resizeObserver = context.use(
    createResizeObserverHook(handleResizeObserverEntries),
  );

  const children = memo(
    () =>
      keyedList(
        items.slice(scopeRef.current.start, scopeRef.current.end),
        (item) => item.id,
        (item, index) => {
          const id = item.id;
          const ref: RefCallback<Element> = (element) => {
            elementToIdMap.set(element, id);
            resizeObserver.observe(element);
            return () => {
              elementToIdMap.delete(element);
              resizeObserver.unobserve(element);
            };
          };
          return renderItem(item, index + scopeRef.current.start, ref, context);
        },
      ),
    [items, scopeRef.current],
  );

  const blankSpaces = getBlankSpaces(
    blockPositionsRef.current,
    scopeRef.current,
  );

  return renderList(children, blankSpaces, containerRef, context);
}

export interface ReactVirtualScrollListProps<
  TItem extends { id: PropertyKey },
> {
  assumedItemSize?: number;
  getScrollContainer?: () => Window | Element;
  getScreen?: () => DOMRectReadOnly;
  initialBlockSizes?: BlockSizes;
  initialItemIndex?: number;
  items: TItem[];
  offscreenRatio?: number;
  onUpdateBlockSizes?: (newBlockSizes: BlockSizes) => void;
  onUpdateDimensions?: (dimensions: Dimensions) => void;
  renderItem: (
    item: TItem,
    index: number,
    ref: React.RefCallback<Element>,
  ) => React.ReactElement<unknown>;
  renderList: (
    children: React.ReactElement<unknown>[],
    blankSpaces: BlankSpaces,
    ref: React.RefObject<Element>,
  ) => React.ReactElement<unknown>;
  scheduleUpdate?: (callback: VoidFunction) => void;
  scrollBy?: (x: number, y: number) => void;
  scrollThrottleTime?: number;
}

interface ReactVirtualScrollListRendererProps<
  TItem extends { id: PropertyKey },
> {
  blockPositions: BlockPosition[];
  containerRef: React.RefObject<Element>;
  items: TItem[];
  onUpdateBlockSizes: (newBlockSizes: BlockSizes) => void;
  renderItem: (
    item: TItem,
    index: number,
    ref: React.RefCallback<Element>,
  ) => React.ReactElement<unknown>;
  renderList: (
    children: React.ReactElement<unknown>[],
    blankSpaces: BlankSpaces,
    ref: React.RefObject<Element>,
  ) => React.ReactElement<unknown>;
  scope: Scope;
}

export const ReactVirtualScrollList = forwardRef(
  function ReactVirtualScrollList<TItem extends { id: PropertyKey }>(
    {
      assumedItemSize = 200,
      getScreen = () =>
        new DOMRect(0, 0, window.innerWidth, window.innerHeight),
      getScrollContainer = () => window,
      items,
      initialItemIndex = -1,
      offscreenRatio = 1.0,
      onUpdateBlockSizes,
      onUpdateDimensions,
      renderItem,
      renderList,
      scrollBy = (x, y) => window.scrollBy(x, y),
      scheduleUpdate = queueMicrotask,
      scrollThrottleTime = 100,
    }: ReactVirtualScrollListProps<TItem>,
    ref: React.ForwardedRef<VirtualScrollListRef>,
  ) {
    const containerRef = useRef<Element | null>(null);
    const scrollingItemIndexRef = useRef(initialItemIndex);
    const blockSizesRef = useMemo(() => ({ current: new Map() }), []);
    const requestUpdate = useMemo(
      () => createScheduler(scheduleUpdate),
      [scheduleUpdate],
    );

    const blockPositionsRef = useMemo(
      () => ({
        current: computeBlockPositions(
          items,
          blockSizesRef.current,
          assumedItemSize,
        ),
      }),
      [],
    );
    const scopeRef = useMemo(
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

    const oldItems = usePrevious(items) ?? [];

    if (items !== oldItems) {
      const newSlice = items.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );
      const oldSlice = oldItems.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );

      if (areIdenticalItems(newSlice, oldSlice)) {
        if (items.length < scopeRef.current.end) {
          scopeRef.current = {
            start: Math.min(items.length - 1, scopeRef.current.start),
            end: items.length,
          };
        }
      } else {
        blockSizesRef.current = new Map();
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

    const [, forceUpdate] = useState({});

    useImperativeHandle(ref, () => ({
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
        forceUpdate({});
      },
    }));

    const isMounted = useIsMounted();

    const updateDimensions = useEvent(() => {
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

      if (!areEqualScopes(scopeRef.current, newScope)) {
        scopeRef.current = newScope;
        forceUpdate({});
      }

      onUpdateDimensions?.({
        blockPositions: blockPositionsRef.current,
        blockSizes: blockSizesRef.current,
        scope: newScope,
        screen,
      });
    });

    const updateBlockSizes = useEvent((newBlockSizes: BlockSizes) => {
      let hasChanged = false;

      for (const id in newBlockSizes) {
        const oldBlockSize = blockSizesRef.current.get(id);
        const newBlockSize = newBlockSizes.get(id);
        if (oldBlockSize !== newBlockSize) {
          blockSizesRef.current.set(id, newBlockSize);
          hasChanged = true;
        }
      }

      if (hasChanged) {
        blockPositionsRef.current = computeBlockPositions(
          items,
          blockSizesRef.current,
          assumedItemSize,
        );
        requestUpdate(updateDimensions);
        onUpdateBlockSizes?.(blockSizesRef.current);
      }
    });

    useEffect(() => {
      const scrollContainer = getScrollContainer();

      const callback = throttle(() => {
        requestUpdate(updateDimensions);
      }, scrollThrottleTime);

      scrollContainer.addEventListener('scroll', callback, {
        passive: true,
      });

      return () => {
        scrollContainer.removeEventListener('scroll', callback);
      };
    }, [getScrollContainer, requestUpdate, scrollThrottleTime]);

    useEffect(() => {
      const newSlice = items.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );
      const oldSlice = oldItems.slice(
        scopeRef.current.start,
        scopeRef.current.end,
      );
      let willUpdate = false;

      if (!areIdenticalItems(newSlice, oldSlice)) {
        blockPositionsRef.current = computeBlockPositions(
          items,
          blockSizesRef.current,
          assumedItemSize,
        );
        willUpdate = true;
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
        willUpdate = true;
      }

      if (willUpdate) {
        requestUpdate(updateDimensions);
      }
    }, [items, requestUpdate, scrollingItemIndexRef.current, scopeRef.current]);

    return (
      <MemoizedVirtualScrollListRenderer
        blockPositions={blockPositionsRef.current}
        containerRef={containerRef}
        items={items}
        onUpdateBlockSizes={updateBlockSizes}
        renderItem={renderItem}
        renderList={renderList}
        scope={scopeRef.current}
      />
    );
  },
) as <TItem extends { id: PropertyKey }>(
  props: ReactVirtualScrollListProps<TItem> & {
    ref?: React.ForwardedRef<VirtualScrollListRef>;
  },
) => React.ReactElement;

const MemoizedVirtualScrollListRenderer = React.memo(
  function VirtualScrollListRenderer<TItem extends { id: PropertyKey }>({
    blockPositions,
    containerRef,
    items,
    onUpdateBlockSizes,
    renderItem,
    renderList,
    scope,
  }: ReactVirtualScrollListRendererProps<TItem>) {
    const elementToIdMap = useMemo(
      () => new WeakMap<Element, TItem['id']>(),
      [],
    );

    const resizeObserver = useResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        const blockSizes = new Map();

        for (let i = 0, l = entries.length; i < l; i++) {
          const entry = entries[i]!;
          const id = elementToIdMap.get(entry.target);
          if (id !== undefined) {
            blockSizes.set(id, entry.borderBoxSize[0]!.blockSize);
          }
        }

        onUpdateBlockSizes(blockSizes);
      },
    );

    const children = items.slice(scope.start, scope.end).map((item, index) => {
      const id = item.id;
      let lastElemnt: Element | null = null;

      const ref = (element: Element | null) => {
        if (element) {
          elementToIdMap.set(element, id);
          resizeObserver.observe(element);
        } else {
          if (lastElemnt !== null) {
            elementToIdMap.delete(lastElemnt);
            resizeObserver.unobserve(lastElemnt);
          }
        }
        lastElemnt = element;
      };

      return renderItem(item, index + scope.start, ref);
    });

    const blankSpaces = getBlankSpaces(blockPositions, scope);

    return renderList(children, blankSpaces, containerRef);
  },
) as <TItem extends { id: PropertyKey }>(
  props: ReactVirtualScrollListRendererProps<TItem>,
) => React.ReactElement;

function areEqualScopes(first: Scope, second: Scope) {
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
): Usable<ResizeObserver> {
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

function createScheduler(
  scheduleFn: (callback: () => void) => void,
): (callback: () => void) => void {
  let isScheduling = false;

  return (callback) => {
    if (isScheduling) {
      return;
    }
    isScheduling = true;
    scheduleFn(() => {
      isScheduling = false;
      callback();
    });
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

function areIdenticalItems<T extends { id: PropertyKey }>(
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

function translateRect(
  rect: DOMRectReadOnly,
  referenceRect: DOMRectReadOnly,
): DOMRectReadOnly {
  const top = rect.top - referenceRect.top;
  const left = rect.left - referenceRect.left;
  return new DOMRect(left, top, rect.width, rect.height);
}

function useResizeObserver(callback: ResizeObserverCallback) {
  const resizeObserver = useMemo(
    () => new ResizeObserver(callback),
    [callback],
  );

  useEffect(() => {
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return resizeObserver;
}
