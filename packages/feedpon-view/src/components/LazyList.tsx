import React, { Component } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

import throttle from 'feedpon-utils/throttle';
import LazyListRenderer from './LazyListRenderer';

interface LazyListProps {
  assumedItemHeight?: number;
  getHeightForDomNode?: (element: HTMLElement) => number;
  getViewportRectangle?: () => ViewportRectangle;
  idAttribute: string;
  initialHeights?: { [id: string]: number };
  initialItemIndex?: number;
  items: any[];
  offscreenToViewportRatio?: number;
  onHeightUpdated?: (updatedHeights: { [id: string]: number }) => void;
  onPositioningUpdated?: (positioning: Positioning) => void;
  renderItem: (
    item: any,
    index: number,
    ref: React.Ref<any>,
  ) => React.ReactElement<any>;
  renderList: (
    items: React.ReactElement<any>[],
    blankSpaceAbove: number,
    blankSpaceBelow: number,
  ) => React.ReactElement<any>;
  scrollThrottleTime?: number;
  shouldUpdate?: () => boolean;
}

interface LazyListState {
  heights: Heights;
  oldItems: any[];
  rectangles: Rectangle[];
  scrollingItemIndex: number;
  sliceEnd: number;
  sliceStart: number;
}

export interface Positioning {
  idAttribute: string;
  items: any[];
  rectangles: Rectangle[];
  sliceEnd: number;
  sliceStart: number;
  viewportRectangle: ViewportRectangle;
}

export interface Rectangle {
  top: number;
  bottom: number;
}

export interface ViewportRectangle extends Rectangle {
  scrollOffset: number;
}

interface Slice {
  sliceEnd: number;
  sliceStart: number;
}

interface BlankSpace {
  blankSpaceAbove: number;
  blankSpaceBelow: number;
}

interface Heights {
  [id: string]: number;
}

export default class LazyList extends Component<LazyListProps, LazyListState> {
  static defaultProps = {
    assumedItemHeight: 200,
    getHeightForDomNode,
    getViewportRectangle,
    initialHeights: {},
    initialItemIndex: -1,
    offscreenToViewportRatio: 1.8,
    scrollThrottleTime: 100,
    shouldUpdate: () => true,
  };

  static getDerivedStateFromProps(props: LazyListProps, state: LazyListState) {
    const { items } = props;
    const { oldItems } = state;

    if (items === oldItems) {
      return null;
    }

    const { idAttribute } = props;
    const { sliceEnd, sliceStart } = state;

    const item = items[sliceStart];
    const oldItem = oldItems[sliceStart];

    if (item && oldItem && item[idAttribute] === oldItem[idAttribute]) {
      const { heights } = state;
      return {
        oldItems: items,
        rectangles: computeRectangles(props, heights),
        sliceEnd: Math.min(items.length, sliceEnd),
        sliceStart,
      };
    } else {
      return {
        ...computeInitialSlice(
          props,
          props.initialHeights!,
          props.initialItemIndex!,
        ),
        heights: props.initialHeights!,
        oldItems: items,
        rectangles: computeRectangles(props, props.initialHeights!),
        scrollingItemIndex: props.initialItemIndex,
      };
    }
  }

  private _rendererRef: React.RefObject<LazyListRenderer>;

  private _isUnmounted: boolean = false;

  constructor(props: LazyListProps) {
    super(props);

    this.state = {
      ...computeInitialSlice(
        props,
        props.initialHeights!,
        props.initialItemIndex!,
      ),
      heights: props.initialHeights!,
      oldItems: props.items,
      rectangles: computeRectangles(props, props.initialHeights!),
      scrollingItemIndex: props.initialItemIndex!,
    };

    this._rendererRef = React.createRef();

    this._handleScroll = throttle(
      createScheduledTask(() => this._update(), window.requestAnimationFrame),
      props.scrollThrottleTime!,
    );
  }

  override shouldComponentUpdate(
    nextProps: LazyListProps,
    nextState: LazyListState,
  ) {
    const { props, state } = this;
    return (
      props.items !== nextProps.items ||
      props.renderItem !== nextProps.renderItem ||
      props.renderList !== nextProps.renderList ||
      state.sliceEnd !== nextState.sliceEnd ||
      state.sliceStart !== nextState.sliceStart ||
      state.scrollingItemIndex !== nextState.scrollingItemIndex
    );
  }

  override componentDidMount() {
    window.addEventListener('scroll', this._handleScroll, {
      passive: true,
    } as any);

    this._postRenderProcessing(true);
  }

  override componentWillUnmount() {
    window.removeEventListener('scroll', this._handleScroll, {
      passive: true,
    } as any);

    this._isUnmounted = true;
  }

  override componentDidUpdate(
    prevProps: LazyListProps,
    _prevState: LazyListState,
  ) {
    this._postRenderProcessing(prevProps.items !== this.props.items);
  }

  override render() {
    const { getHeightForDomNode, idAttribute, items, renderItem, renderList } =
      this.props;
    const { sliceStart, sliceEnd } = this.state;
    const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace(
      sliceStart,
      sliceEnd,
    );

    return (
      <LazyListRenderer
        blankSpaceAbove={blankSpaceAbove}
        blankSpaceBelow={blankSpaceBelow}
        getHeightForDomNode={getHeightForDomNode!}
        idAttribute={idAttribute}
        items={items}
        ref={this._rendererRef}
        renderItem={renderItem}
        renderList={renderList}
        sliceEnd={sliceEnd}
        sliceStart={sliceStart}
      />
    );
  }

  scrollToIndex(index: number): void {
    const { sliceStart, sliceEnd } = this.state;

    if (sliceStart <= index && index < sliceEnd) {
      const scrollOffset = this._getScrollOffset(index);

      if (scrollOffset !== 0) {
        window.scrollBy(0, scrollOffset);
      }
    } else {
      const { heights } = this.state;
      const slice = computeInitialSlice(this.props, heights, index);

      this.setState({
        ...slice,
        scrollingItemIndex: index,
      });
    }
  }

  private _postRenderProcessing(hasItemsChanged: boolean): void {
    const { scrollingItemIndex } = this.state;

    const wasHeightChanged = this._recomputeHeights();

    if (scrollingItemIndex > -1) {
      this._updateScrollIndex(scrollingItemIndex);
    } else if (wasHeightChanged || hasItemsChanged) {
      this._scheduleUpdate();
    }
  }

  private _update(): void {
    if (this._isUnmounted) {
      return;
    }

    const { shouldUpdate } = this.props;
    if (!shouldUpdate!()) {
      return;
    }

    const viewportRectangle = this._getRelativeViewportRectangle();
    const { onPositioningUpdated } = this.props;

    if (onPositioningUpdated) {
      onPositioningUpdated(this._getPositioning(viewportRectangle));
    }

    const slice = this._getCurrentSlice(viewportRectangle);

    this.setState(slice);
  }

  private _recomputeHeights(): boolean {
    const { assumedItemHeight } = this.props;
    const { heights } = this.state;

    const computedHeights = this._rendererRef.current
      ? this._rendererRef.current.getItemHeights()
      : {};
    const updatedHeights: { [id: string]: number } = {};

    let updates = 0;

    for (const id in computedHeights) {
      const prevHeight = heights[id] ?? assumedItemHeight!;
      const computedHeight = computedHeights[id]!;

      if (prevHeight !== computedHeight) {
        updatedHeights[id] = computedHeight;
        updates++;
      }
    }

    if (updates > 0) {
      const nextHeights = Object.assign({}, heights, updatedHeights);

      this.setState({
        heights: nextHeights,
        rectangles: computeRectangles(this.props, nextHeights),
      });

      const { onHeightUpdated } = this.props;
      if (onHeightUpdated) {
        onHeightUpdated(updatedHeights);
      }

      return true;
    }

    return false;
  }

  private _updateScrollIndex(index: number): void {
    const scrollOffset = this._getScrollOffset(index);

    if (scrollOffset !== 0) {
      window.scrollBy(0, scrollOffset);
    }

    this.setState({
      scrollingItemIndex: -1,
    });
  }

  private _computeBlankSpace(sliceStart: number, sliceEnd: number): BlankSpace {
    const { rectangles } = this.state;

    if (rectangles.length === 0) {
      return {
        blankSpaceAbove: 0,
        blankSpaceBelow: 0,
      };
    }

    const blankSpaceAbove =
      sliceStart < rectangles.length
        ? rectangles[sliceStart]!.top
        : rectangles[rectangles.length - 1]!.bottom;
    const blankSpaceBelow =
      sliceEnd < rectangles.length
        ? rectangles[rectangles.length - 1]!.bottom - rectangles[sliceEnd]!.top
        : 0;

    return {
      blankSpaceAbove,
      blankSpaceBelow,
    };
  }

  private _getPositioning(viewportRectangle: ViewportRectangle): Positioning {
    const { items, idAttribute } = this.props;
    const { rectangles, sliceEnd, sliceStart } = this.state;

    return {
      idAttribute,
      items,
      rectangles,
      sliceEnd,
      sliceStart,
      viewportRectangle,
    };
  }

  private _getCurrentSlice(viewportRectangle: ViewportRectangle): Slice {
    const { rectangles } = this.state;

    if (rectangles.length === 0) {
      return {
        sliceStart: 0,
        sliceEnd: 0,
      };
    }

    const { offscreenToViewportRatio } = this.props;
    const offscreenHeight =
      (viewportRectangle.bottom - viewportRectangle.top) *
      offscreenToViewportRatio!;
    const top = viewportRectangle.top - offscreenHeight;
    const bottom = viewportRectangle.bottom + offscreenHeight;

    let sliceStart = 0;
    for (let i = sliceStart, l = rectangles.length; i < l; i++) {
      const rectangle = rectangles[i]!;
      if (rectangle.bottom > top) {
        break;
      }
      sliceStart = i;
    }

    let sliceEnd = sliceStart + 1;
    for (let i = sliceEnd, l = rectangles.length; i < l; i++) {
      const rectangle = rectangles[i]!;
      if (rectangle.top >= bottom) {
        break;
      }
      sliceEnd = i + 1;
    }

    return {
      sliceStart,
      sliceEnd,
    };
  }

  private _getRelativeViewportRectangle(): ViewportRectangle {
    if (!this._rendererRef.current) {
      return createViewportRectangle(0, 0, 0);
    }

    const { getViewportRectangle } = this.props;
    const rectangle = getViewportRectangle!();
    const listElement = findDOMNode(this._rendererRef.current) as HTMLElement;

    const top = -listElement.getBoundingClientRect().top + rectangle.top;
    const height = rectangle.bottom - rectangle.top;

    return createViewportRectangle(top, height, rectangle.scrollOffset);
  }

  private _getScrollOffset(index: number): number {
    const viewportRectangle = this._getRelativeViewportRectangle();
    const { rectangles } = this.state;

    if (index < 0 || rectangles.length === 0) {
      return 0;
    }

    const viewportTop = viewportRectangle.top + viewportRectangle.scrollOffset;

    const offset =
      index >= rectangles.length
        ? rectangles[rectangles.length - 1]!.bottom - viewportTop
        : rectangles[index]!.top - viewportTop;

    return Math.ceil(offset);
  }

  private _handleScroll: () => void;

  private _scheduleUpdate = createScheduledTask(
    () => this._update(),
    window.requestIdleCallback || window.requestAnimationFrame,
  );
}

function computeInitialSlice(
  props: LazyListProps,
  heights: Heights,
  initialItemIndex: number,
): Slice {
  const { assumedItemHeight, getViewportRectangle, idAttribute, items } = props;
  const viewportRectangle = getViewportRectangle!();
  const viewportHeight = viewportRectangle.bottom - viewportRectangle.top;

  const sliceStart = Math.max(0, initialItemIndex);
  let sliceEnd = sliceStart;

  for (
    let i = sliceEnd, l = items.length, space = viewportHeight;
    i < l && space > 0;
    i++
  ) {
    const item = items[i];
    const id = item[idAttribute];
    const height = heights[id] || assumedItemHeight!;
    sliceEnd = i + 1;
    space -= height;
  }

  return {
    sliceStart,
    sliceEnd,
  };
}

function computeRectangles(
  props: LazyListProps,
  heights: Heights,
): Rectangle[] {
  const { assumedItemHeight, idAttribute, items } = props;
  let top = 0;
  return items.map((item) => {
    const id = item[idAttribute];
    const height = heights[id] || assumedItemHeight!;
    const rectangle = createRectangle(top, height);
    top = rectangle.bottom;
    return rectangle;
  });
}

function getHeightForDomNode(element: HTMLElement): number {
  return element.getBoundingClientRect().height;
}

function getViewportRectangle(): ViewportRectangle {
  return {
    top: 0,
    bottom: window.innerHeight,
    scrollOffset: 0,
  };
}

function createRectangle(top: number, height: number): Rectangle {
  return {
    top,
    bottom: top + height,
  } as Rectangle;
}

function createViewportRectangle(
  top: number,
  height: number,
  scrollOffset: number,
): ViewportRectangle {
  return {
    top,
    bottom: top + height,
    scrollOffset,
  };
}

function createScheduledTask(
  task: () => void,
  scheduler: (task: () => void) => number,
): () => number {
  let token: number | null = null;

  function runTask() {
    token = null;
    task();
  }

  return () => {
    if (token === null) {
      token = scheduler(runTask);
    }
    return token;
  };
}
