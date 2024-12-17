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

export interface BlockInset {
  start: number;
  end: number;
}

export type BlockSizes = Map<PropertyKey, number>;

export interface Dimensions {
  blockInsets: BlockInset[];
  blockSizes: BlockSizes;
  slice: Slice;
  viewportInset: BlockInset;
}

export interface Slice {
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
  getViewportInset?: () => BlockInset;
  initialItemIndex?: number;
  items: TItem[];
  offscreenToViewportRatio?: number;
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
    getViewportInset = () => ({ start: 0, end: window.innerHeight }),
    initialItemIndex = -1,
    items,
    offscreenToViewportRatio = 1.0,
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
  const blockInsetsRef = context.useMemo(
    () => ({
      current: computeBlockInsets(
        items,
        blockSizesRef.current,
        assumedItemSize,
      ),
    }),
    [],
  );
  const sliceRef = context.useMemo(
    () => ({
      current: getInitialSlice(
        items,
        blockSizesRef.current,
        assumedItemSize,
        initialItemIndex,
        getViewportInset(),
      ),
    }),
    [],
  );
  const oldItems = context.use(createPreviousHook(items)) ?? [];

  if (items !== oldItems) {
    if (
      areIdenticalItems(
        items.slice(sliceRef.current.start, sliceRef.current.end),
        oldItems.slice(sliceRef.current.start, sliceRef.current.end),
      )
    ) {
      if (sliceRef.current.end > items.length) {
        sliceRef.current = {
          start: Math.min(items.length - 1, sliceRef.current.start),
          end: items.length,
        };
      }
    } else {
      scrollingItemIndexRef.current = initialItemIndex;
      sliceRef.current = getInitialSlice(
        items,
        blockSizesRef.current,
        assumedItemSize,
        initialItemIndex,
        getViewportInset(),
      );
    }

    blockInsetsRef.current = computeBlockInsets(
      items,
      blockSizesRef.current,
      assumedItemSize,
    );
  }

  const [, forceUpdate] = context.useState({});

  ref.current = {
    scrollTo(index: number): void {
      sliceRef.current = getInitialSlice(
        items,
        blockSizesRef.current,
        assumedItemSize,
        index,
        getViewportInset(),
      );

      scrollingItemIndexRef.current = index;

      // Force update even if the slice has not changed.
      forceUpdate({});
    },
  };

  const isMounted = context.use(isMountedHook);

  const updateDimensions = context.useCallback(() => {
    if (!isMounted()) {
      requestAnimationFrame(updateDimensions);
      return;
    }

    const viewportInset = containerRef.current
      ? translateViewportInset(
          getViewportInset(),
          containerRef.current.getBoundingClientRect(),
        )
      : getViewportInset();

    const newSlice = getCurrentSlice(
      blockInsetsRef.current,
      viewportInset,
      offscreenToViewportRatio,
    );

    if (!areEqualSlices(sliceRef.current, newSlice)) {
      sliceRef.current = newSlice;
      forceUpdate({});
    }

    onUpdateDimensions?.({
      blockInsets: blockInsetsRef.current,
      blockSizes: blockSizesRef.current,
      slice: newSlice,
      viewportInset,
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

    if (!areIdenticalItems(items, oldItems)) {
      blockInsetsRef.current = computeBlockInsets(
        items,
        blockSizesRef.current,
        assumedItemSize,
      );
      willUpdate = true;
    }

    if (scrollingItemIndexRef.current >= 0) {
      const viewportInset = containerRef.current
        ? translateViewportInset(
            getViewportInset(),
            containerRef.current.getBoundingClientRect(),
          )
        : getViewportInset();

      const scrollOffset = getScrollOffset(
        blockInsetsRef.current,
        scrollingItemIndexRef.current,
        viewportInset,
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
  }, [items, scrollingItemIndexRef.current, sliceRef.current]);

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

      blockInsetsRef.current = computeBlockInsets(
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
        items.slice(sliceRef.current.start, sliceRef.current.end),
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
          return renderItem(item, index + sliceRef.current.start, ref, context);
        },
      ),
    [items, sliceRef.current.end, sliceRef.current.start],
  );

  const blankSpaces = getBlankSpaces(blockInsetsRef.current, sliceRef.current);

  return renderList(children, blankSpaces, containerRef, context);
}

export interface ReactVirtualScrollListProps<
  TItem extends { id: PropertyKey },
> {
  assumedItemSize?: number;
  getScrollContainer?: () => Window | Element;
  getViewportInset?: () => BlockInset;
  initialBlockSizes?: BlockSizes;
  initialItemIndex?: number;
  items: TItem[];
  offscreenToViewportRatio?: number;
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
  blockInsets: BlockInset[];
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
  slice: Slice;
}

export const ReactVirtualScrollList = forwardRef(
  function ReactVirtualScrollList<TItem extends { id: PropertyKey }>(
    {
      assumedItemSize = 200,
      getViewportInset = () => ({ start: 0, end: window.innerHeight }),
      getScrollContainer = () => window,
      items,
      initialItemIndex = -1,
      offscreenToViewportRatio = 1.0,
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

    const blockInsetsRef = useMemo(
      () => ({
        current: computeBlockInsets(
          items,
          blockSizesRef.current,
          assumedItemSize,
        ),
      }),
      [],
    );
    const sliceRef = useMemo(
      () => ({
        current: getInitialSlice(
          items,
          blockSizesRef.current,
          assumedItemSize,
          initialItemIndex,
          getViewportInset(),
        ),
      }),
      [],
    );

    const oldItems = usePrevious(items) ?? [];

    if (items !== oldItems) {
      if (
        areIdenticalItems(
          items.slice(sliceRef.current.start, sliceRef.current.end),
          oldItems.slice(sliceRef.current.start, sliceRef.current.end),
        )
      ) {
        if (sliceRef.current.end > items.length) {
          sliceRef.current = {
            start: Math.min(items.length - 1, sliceRef.current.start),
            end: items.length,
          };
        }
      } else {
        blockSizesRef.current = new Map();
        scrollingItemIndexRef.current = initialItemIndex;
        sliceRef.current = getInitialSlice(
          items,
          blockSizesRef.current,
          assumedItemSize,
          initialItemIndex,
          getViewportInset(),
        );
      }

      blockInsetsRef.current = computeBlockInsets(
        items,
        blockSizesRef.current,
        assumedItemSize,
      );
    }

    const [, forceUpdate] = useState({});

    useImperativeHandle(ref, () => ({
      scrollTo(index: number): void {
        sliceRef.current = getInitialSlice(
          items,
          blockSizesRef.current,
          assumedItemSize,
          index,
          getViewportInset(),
        );

        scrollingItemIndexRef.current = index;

        // Force update even if the slice has not changed.
        forceUpdate({});
      },
    }));

    const isMounted = useIsMounted();

    const updateDimensions = useEvent(() => {
      if (!isMounted()) {
        requestAnimationFrame(updateDimensions);
        return;
      }

      const viewportInset = containerRef.current
        ? translateViewportInset(
            getViewportInset(),
            containerRef.current.getBoundingClientRect(),
          )
        : getViewportInset();

      const newSlice = getCurrentSlice(
        blockInsetsRef.current,
        viewportInset,
        offscreenToViewportRatio,
      );

      if (!areEqualSlices(sliceRef.current, newSlice)) {
        sliceRef.current = newSlice;
        forceUpdate({});
      }

      onUpdateDimensions?.({
        blockInsets: blockInsetsRef.current,
        blockSizes: blockSizesRef.current,
        slice: newSlice,
        viewportInset,
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
        blockInsetsRef.current = computeBlockInsets(
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
      let willUpdate = false;

      if (
        items.length !== oldItems.length ||
        !areIdenticalItems(items, oldItems)
      ) {
        blockInsetsRef.current = computeBlockInsets(
          items,
          blockSizesRef.current,
          assumedItemSize,
        );
        willUpdate = true;
      }

      if (scrollingItemIndexRef.current >= 0) {
        const viewportInset = containerRef.current
          ? translateViewportInset(
              getViewportInset(),
              containerRef.current.getBoundingClientRect(),
            )
          : getViewportInset();

        const scrollOffset = getScrollOffset(
          blockInsetsRef.current,
          scrollingItemIndexRef.current,
          viewportInset,
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
    }, [items, requestUpdate, scrollingItemIndexRef.current, sliceRef.current]);

    return (
      <MemoizedVirtualScrollListRenderer
        blockInsets={blockInsetsRef.current}
        containerRef={containerRef}
        items={items}
        onUpdateBlockSizes={updateBlockSizes}
        renderItem={renderItem}
        renderList={renderList}
        slice={sliceRef.current}
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
    blockInsets,
    containerRef,
    items,
    onUpdateBlockSizes,
    renderItem,
    renderList,
    slice,
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

    const children = items.slice(slice.start, slice.end).map((item, index) => {
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

      return renderItem(item, index + slice.start, ref);
    });

    const blankSpaces = getBlankSpaces(blockInsets, slice);

    return renderList(children, blankSpaces, containerRef);
  },
) as <TItem extends { id: PropertyKey }>(
  props: ReactVirtualScrollListRendererProps<TItem>,
) => React.ReactElement;

function areEqualSlices(first: Slice, second: Slice) {
  return first.start === second.start && first.end === second.end;
}

function computeBlockInsets<TItem extends { id: PropertyKey }>(
  items: TItem[],
  blockSizes: BlockSizes,
  assumedItemSize: number,
): BlockInset[] {
  const blockInsets = new Array(items.length);

  for (let start = 0, i = 0, l = items.length; i < l; i++) {
    const item = items[i]!;
    const id = item.id as TItem['id'];
    const size = blockSizes.get(id) ?? assumedItemSize;
    const blockInset = { start, end: start + size };
    start = blockInset.end;
    blockInsets[i] = blockInset;
  }

  return blockInsets;
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

function getBlankSpaces(blockInsets: BlockInset[], slice: Slice): BlankSpaces {
  if (blockInsets.length === 0) {
    return {
      above: 0,
      below: 0,
    };
  }

  const above =
    slice.start < blockInsets.length
      ? blockInsets[slice.start]!.start
      : blockInsets[blockInsets.length - 1]!.end;
  const below =
    slice.end < blockInsets.length
      ? blockInsets[blockInsets.length - 1]!.end - blockInsets[slice.end]!.start
      : 0;

  return {
    above,
    below,
  };
}

function getCurrentSlice(
  blockInsets: BlockInset[],
  viewportInset: BlockInset,
  offscreenToViewportRatio: number,
): Slice {
  if (blockInsets.length === 0) {
    return {
      start: 0,
      end: 0,
    };
  }

  const offscreenSize =
    (viewportInset.end - viewportInset.start) * offscreenToViewportRatio;
  const viewportStart = viewportInset.start - offscreenSize;
  const viewportEnd = viewportInset.end + offscreenSize;

  const size = blockInsets.length;
  let start = 0;

  for (let i = 0; i < size; i++) {
    const blockInset = blockInsets[start]!;
    if (blockInset.end > viewportStart) {
      break;
    }
    start = i;
  }

  let end = start + 1;

  for (let i = end; i < size; i++) {
    const blockInset = blockInsets[end]!;
    if (blockInset.start >= viewportEnd) {
      break;
    }
    end = i + 1;
  }

  return {
    start,
    end,
  };
}

function getInitialSlice<TItem extends { id: PropertyKey }>(
  items: TItem[],
  blockSizes: BlockSizes,
  assumedItemSize: number,
  initialItemIndex: number,
  viewportInset: BlockInset,
): Slice {
  const viewportSize = viewportInset.end - viewportInset.start;

  const start = Math.max(0, initialItemIndex);
  let end = start;

  for (
    let l = items.length, remainingSpace = viewportSize;
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
  blockInsets: BlockInset[],
  index: number,
  viewportInset: BlockInset,
): number {
  if (index < 0 || blockInsets.length === 0) {
    return 0;
  }

  return index >= blockInsets.length
    ? blockInsets[blockInsets.length - 1]!.end - viewportInset.start
    : blockInsets[index]!.start - viewportInset.start;
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

function translateViewportInset(
  viewportInset: BlockInset,
  containerInset: DOMRect,
): BlockInset {
  const start = viewportInset.start - containerInset.top;
  const size = viewportInset.end - viewportInset.start;
  return {
    start,
    end: start + size,
  };
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
