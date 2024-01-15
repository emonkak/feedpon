import throttle from 'feedpon-utils/throttle';
import shallowEqual from 'feedpon-utils/shallowEqual';
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import useEvent from '../hooks/useEvent';
import useIsMounted from '../hooks/useIsMounted';
import usePrevious from '../hooks/usePrevious';

export interface BlankSpaces {
  above: number;
  below: number;
}

export interface BlockInset {
  start: number;
  end: number;
}

export type BlockSizes<TId extends PropertyKey> = { [id in TId]: number };

export interface Dimensions<TId extends PropertyKey> {
  blockInsets: BlockInset[];
  blockSizes: BlockSizes<TId>;
  slice: Slice;
  viewportInset: BlockInset;
}

export interface Slice {
  end: number;
  start: number;
}

export interface VirtualListProps<
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
> {
  assumedItemSize?: number;
  getScrollContainer?: () => Window | Element;
  getViewportInset?: () => BlockInset;
  idAttribute: TIdAttribute;
  initialBlockSizes?: BlockSizes<TId>;
  initialItemIndex?: number;
  items: TItem[];
  offscreenToViewportRatio?: number;
  onUpdateBlockSizes?: (newBlockSizes: BlockSizes<TId>) => void;
  onUpdateDimensions?: (dimensions: Dimensions<TId>) => void;
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

export interface VirtualListRef {
  scrollTo(index: number): void;
}

interface VirtualListRendererProps<
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
> {
  blockInsets: BlockInset[];
  containerRef: React.RefObject<Element>;
  idAttribute: TIdAttribute;
  items: TItem[];
  onUpdateBlockSizes: (newBlockSizes: BlockSizes<TId>) => void;
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

export default (forwardRef(VirtualList) as <
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
>(
  props: VirtualListProps<TItem, TIdAttribute, TId> & {
    ref?: React.ForwardedRef<VirtualListRef>;
  },
) => ReturnType<typeof VirtualList>);

function VirtualList<
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
>(
  {
    assumedItemSize = 200,
    getViewportInset = () => ({ start: 0, end: window.innerHeight }),
    getScrollContainer = () => window,
    idAttribute,
    items,
    initialBlockSizes = {} as BlockSizes<TId>,
    initialItemIndex = -1,
    offscreenToViewportRatio = 1.0,
    onUpdateBlockSizes,
    onUpdateDimensions,
    renderItem,
    renderList,
    scrollBy = (x, y) => window.scrollBy(x, y),
    scheduleUpdate = queueMicrotask,
    scrollThrottleTime = 100,
  }: VirtualListProps<TItem, TIdAttribute, TId>,
  ref: React.ForwardedRef<VirtualListRef>,
) {
  const containerRef = useRef<Element | null>(null);
  const scrollingItemIndexRef = useRef(initialItemIndex);
  const blockSizesRef = useRef(initialBlockSizes);

  const blockInsetsRef = useMemo(
    () => ({
      current: computeBlockInsets(
        items,
        blockSizesRef.current,
        idAttribute,
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
        idAttribute,
        initialItemIndex,
        getViewportInset(),
      ),
    }),
    [],
  );

  const oldItems = usePrevious(items) ?? [];

  if (items !== oldItems) {
    const currentIds = items
      .slice(sliceRef.current.start, sliceRef.current.end)
      .map((item) => item[idAttribute]);
    const oldIds = oldItems
      .slice(sliceRef.current.start, sliceRef.current.end)
      .map((item) => item[idAttribute]);

    if (shallowEqual(currentIds, oldIds)) {
      if (sliceRef.current.end > items.length) {
        sliceRef.current = {
          start: Math.min(items.length - 1, sliceRef.current.start),
          end: items.length,
        };
      }
    } else {
      blockSizesRef.current = initialBlockSizes;
      scrollingItemIndexRef.current = initialItemIndex;
      sliceRef.current = getInitialSlice(
        items,
        blockSizesRef.current,
        assumedItemSize,
        idAttribute,
        initialItemIndex,
        getViewportInset(),
      );
    }

    blockInsetsRef.current = computeBlockInsets(
      items,
      blockSizesRef.current,
      idAttribute,
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
        idAttribute,
        index,
        getViewportInset(),
      );

      scrollingItemIndexRef.current = index;

      // Force update even if the slice has not changed.
      forceUpdate({});
    },
  }));

  const isMouted = useIsMounted();

  const updateDimensions = useEvent(() => {
    if (!isMouted()) {
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

  const updateBlockSizes = useEvent((newBlockSizes: BlockSizes<TId>) => {
    let hasChanged = false;

    for (const id in newBlockSizes) {
      const oldBlockSize = blockSizesRef.current[id];
      const newBlockSize = newBlockSizes[id];
      if (oldBlockSize !== newBlockSize) {
        blockSizesRef.current[id] = newBlockSize;
        hasChanged = true;
      }
    }

    if (hasChanged) {
      blockInsetsRef.current = computeBlockInsets(
        items,
        blockSizesRef.current,
        idAttribute,
        assumedItemSize,
      );
      scheduleUpdate(updateDimensions);
      onUpdateBlockSizes?.(blockSizesRef.current);
    }
  });

  useEffect(() => {
    const scrollContainer = getScrollContainer();

    const callback = throttle(() => {
      scheduleUpdate(updateDimensions);
    }, scrollThrottleTime);

    scrollContainer.addEventListener('scroll', callback, {
      passive: true,
    });

    return () => {
      scrollContainer.removeEventListener('scroll', callback);
    };
  }, [getScrollContainer, scheduleUpdate, scrollThrottleTime]);

  useEffect(() => {
    let willUpdate = false;

    if (
      items.length !== oldItems.length ||
      !shallowEqual(
        items.map((item) => item[idAttribute]),
        oldItems.map((item) => item[idAttribute]),
      )
    ) {
      blockInsetsRef.current = computeBlockInsets(
        items,
        blockSizesRef.current,
        idAttribute,
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
      scheduleUpdate(updateDimensions);
    }
  }, [items, scrollingItemIndexRef.current, sliceRef.current]);

  return (
    <MemoizedVirtualListRenderer
      blockInsets={blockInsetsRef.current}
      containerRef={containerRef}
      idAttribute={idAttribute}
      items={items}
      onUpdateBlockSizes={updateBlockSizes}
      renderItem={renderItem}
      renderList={renderList}
      slice={sliceRef.current}
    />
  );
}

const MemoizedVirtualListRenderer = memo(VirtualListRenderer) as <
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
>(
  props: VirtualListRendererProps<TItem, TIdAttribute, TId>,
) => ReturnType<typeof VirtualListRenderer>;

function VirtualListRenderer<
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
>({
  blockInsets,
  idAttribute,
  containerRef,
  items,
  onUpdateBlockSizes,
  renderItem,
  renderList,
  slice,
}: VirtualListRendererProps<TItem, TIdAttribute, TId>) {
  const elementToIdMap = useMemo(() => new WeakMap<Element, TId>(), []);

  const resizeObserver = useResizeObserver((entries: ResizeObserverEntry[]) => {
    const blockSizes = {} as BlockSizes<TId>;

    for (let i = 0, l = entries.length; i < l; i++) {
      const entry = entries[i]!;
      const id = elementToIdMap.get(entry.target);
      if (id !== undefined) {
        blockSizes[id] = entry.borderBoxSize[0]!.blockSize;
      }
    }

    onUpdateBlockSizes(blockSizes);
  });

  const children = items.slice(slice.start, slice.end).map((item, index) => {
    const id = item[idAttribute];
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
}

function areEqualSlices(first: Slice, second: Slice) {
  return first.start === second.start && first.end === second.end;
}

function computeBlockInsets<
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
>(
  items: TItem[],
  blockSizes: BlockSizes<TId>,
  idAttribute: TIdAttribute,
  assumedItemSize: number,
): BlockInset[] {
  const blockInsets = new Array(items.length);

  for (let start = 0, i = 0, l = items.length; i < l; i++) {
    const item = items[i]!;
    const id = item[idAttribute];
    const size = blockSizes[id] ?? assumedItemSize;
    const blockInset = { start, end: start + size };
    start = blockInset.end;
    blockInsets[i] = blockInset;
  }

  return blockInsets;
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

function getInitialSlice<
  TItem extends { [key in TIdAttribute]: TId },
  TIdAttribute extends keyof TItem,
  TId extends PropertyKey,
>(
  items: TItem[],
  blockSizes: BlockSizes<TId>,
  assumedItemSize: number,
  idAttribute: TIdAttribute,
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
    const id = item[idAttribute];
    const size = blockSizes[id] ?? assumedItemSize;
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
  const isRendering = useIsRendering();
  const defferedEntriesRef = useRef<ResizeObserverEntry[]>([]);

  const resizeHandler = useEvent(
    (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
      if (isRendering()) {
        defferedEntriesRef.current.push(...entries);
      } else {
        callback(entries, observer);
      }
    },
  );

  const resizeObserver = useMemo(() => new ResizeObserver(resizeHandler), []);

  useEffect(() => {
    if (defferedEntriesRef.current.length > 0) {
      callback(defferedEntriesRef.current, resizeObserver);
      defferedEntriesRef.current = [];
    }
  });

  useEffect(() => {
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return resizeObserver;
}

function useIsRendering(): () => boolean {
  const isRenderingRef = useRef(true);

  isRenderingRef.current = true;

  useEffect(() => {
    isRenderingRef.current = false;
  });

  return () => isRenderingRef.current;
}
