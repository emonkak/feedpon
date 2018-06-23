import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { findDOMNode } from 'react-dom';
import { createSelector } from 'reselect';

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
    renderItem: (item: any, index: number, ref: React.Ref<any>) => React.ReactElement<any>;
    renderList: (items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) => React.ReactElement<any>;
    scrollDebounceTime?: number;
}

interface LazyListState {
    lastHeights: { [id: string]: number };
    lastItems: any[];
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

export default class LazyList extends Component<LazyListProps, LazyListState, Positioning> {
    static defaultProps = {
        assumedItemHeight: 200,
        getHeightForDomNode,
        getViewportRectangle,
        initialHeights: {},
        initialItemIndex: -1,
        offscreenToViewportRatio: 1.8,
        scrollDebounceTime: 100
    };

    static getDerivedStateFromProps(nextProps: LazyListProps, prevState: LazyListState) {
        const { items } = nextProps;
        const { lastItems } = prevState;

        if (items === lastItems) {
            return null;
        }

        const { idAttribute } = nextProps;
        const { sliceStart, sliceEnd } = prevState;

        const item = items[sliceStart];
        const lastItem = lastItems[sliceStart];

        if (item && lastItem && item[idAttribute] === lastItem[idAttribute]) {
            return {
                sliceStart,
                sliceEnd: Math.min(lastItems.length, sliceEnd),
                lastItems: items
            };
        } else {
            return {
                ...getInitialSlice(nextProps, prevState.lastHeights, nextProps.initialItemIndex!),
                lastItems: items,
                scrollingItemIndex: nextProps.initialItemIndex
            };
        }
    }

    private _heights: { [id: string]: number } = {};

    private _prevPositioning: Positioning | null = null;

    private _ref: LazyListRenderer | null = null;

    private _isUnmounted: boolean = false;

    constructor(props: LazyListProps) {
        super(props);

        this.state = {
            ...getInitialSlice(props, props.initialHeights!, props.initialItemIndex!),
            lastItems: props.items,
            lastHeights: props.initialHeights!,
            scrollingItemIndex: props.initialItemIndex!
        };

        this._handleScroll = debounce(
            createScheduledTask(() => this._update(), window.requestAnimationFrame),
            props.scrollDebounceTime!,
            {
                trailing: true
            }
        );
    }

    getSnapshotBeforeUpdate(prevProps: LazyListProps, prevState: LazyListState) {
        const viewportRectangle = this._getRelativeViewportRectangle();

        return this._getPositioning(prevProps, prevState, viewportRectangle);
    }

    shouldComponentUpdate(nextProps: LazyListProps, nextState: LazyListState) {
        const { props, state } = this;
        return props.items !== nextProps.items ||
            props.renderItem !== nextProps.renderItem ||
            props.renderList !== nextProps.renderList ||
            state.sliceEnd !== nextState.sliceEnd ||
            state.sliceStart !== nextState.sliceStart ||
            state.scrollingItemIndex !== nextState.scrollingItemIndex;
    }

    componentDidMount() {
        window.addEventListener('scroll', this._handleScroll, { passive: true } as any);

        this._postRenderProcessing(true);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll, { passive: true } as any);

        this._isUnmounted = true;
    }

    componentDidUpdate(prevProps: LazyListProps, prevState: LazyListState, snapshot: Positioning) {
        this._prevPositioning = snapshot;

        this._postRenderProcessing(prevProps.items !== this.props.items);
    }

    render() {
        const { getHeightForDomNode, idAttribute, items, renderItem, renderList } = this.props;
        const { sliceStart, sliceEnd } = this.state;
        const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace(sliceStart, sliceEnd);

        return (
            <LazyListRenderer
                blankSpaceAbove={blankSpaceAbove}
                blankSpaceBelow={blankSpaceBelow}
                getHeightForDomNode={getHeightForDomNode!}
                idAttribute={idAttribute}
                items={items}
                ref={this._handleRef}
                renderItem={renderItem}
                renderList={renderList}
                sliceEnd={sliceEnd}
                sliceStart={sliceStart} />
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
            const slice = getInitialSlice(this.props, this._heights, index);

            this.setState({
                ...slice,
                scrollingItemIndex: index
            });
        }
    }

    private _postRenderProcessing(hasItemsChanged: boolean): void {
        const { scrollingItemIndex } = this.state;

        const wasHeightChanged = this._recomputeHeights();

        if (scrollingItemIndex > -1) {
            this._updateScrollIndex(scrollingItemIndex);
        } else if (wasHeightChanged || hasItemsChanged) {
            this._adjestScrollPosition();
            this._scheduleUpdate();
        }
    }

    private _update(): void {
        if (this._isUnmounted) {
            return;
        }

        const viewportRectangle = this._getRelativeViewportRectangle();
        const { onPositioningUpdated } = this.props;

        if (onPositioningUpdated) {
            onPositioningUpdated(this._getPositioning(this.props, this.state, viewportRectangle));
        }

        const slice = this._getCurrentSlice(viewportRectangle);

        this.setState(slice);
    }

    private _recomputeHeights(): boolean {
        const { assumedItemHeight } = this.props;

        const computedHeights = this._ref ? this._ref.getItemHeights() : {};
        const updatedHeights: { [id: string]: number } = {};

        let updates = 0;

        for (const id in computedHeights) {
            const prevHeight = this._heights[id] || assumedItemHeight!;
            const computedHeight = computedHeights[id];

            if (prevHeight !== computedHeight) {
                updatedHeights[id] = computedHeight;
                updates++;
            }
        }

        if (updates > 0) {
            this._heights = Object.assign({}, this._heights, updatedHeights);

            this.setState({
                lastHeights: this._heights
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
        } else {
            this.setState({
                scrollingItemIndex: -1
            });
        }
    }

    private _adjestScrollPosition(): void {
        if (this._prevPositioning) {
            const viewportRectangle = this._getRelativeViewportRectangle();
            const positioning = this._getPositioning(this.props, this.state, viewportRectangle);
            const adjustmentDelta = getScrollAdjustmentDelta(this._prevPositioning, positioning);
            if (adjustmentDelta !== 0) {
                window.scrollBy(0, adjustmentDelta);
            }
        }
    }

    private _computeBlankSpace(sliceStart: number, sliceEnd: number): BlankSpace {
        const rectangles = this._getRectangles(this.props, this._heights);

        if (rectangles.length === 0) {
            return {
                blankSpaceAbove: 0,
                blankSpaceBelow: 0
            };
        }

        const blankSpaceAbove = sliceStart < rectangles.length ?
            rectangles[sliceStart].top :
            rectangles[rectangles.length - 1].bottom;
        const blankSpaceBelow = sliceEnd < rectangles.length ?
            rectangles[rectangles.length - 1].bottom - rectangles[sliceEnd].top :
            0;

        return {
            blankSpaceAbove,
            blankSpaceBelow
        };
    }

    private _getPositioning(props: LazyListProps, state: LazyListState, viewportRectangle: ViewportRectangle): Positioning {
        const { items, idAttribute } = props;
        const { sliceStart, sliceEnd } = state;
        const rectangles = this._getRectangles(props, this._heights);

        return {
            idAttribute,
            items,
            rectangles,
            sliceEnd,
            sliceStart,
            viewportRectangle
        };
    }

    private _getCurrentSlice(viewportRectangle: ViewportRectangle): Slice {
        const rectangles = this._getRectangles(this.props, this._heights);

        if (rectangles.length === 0) {
            return {
                sliceStart: 0,
                sliceEnd: 0
            };
        }

        const { offscreenToViewportRatio } = this.props;
        const offscreenHeight = (viewportRectangle.bottom - viewportRectangle.top) * offscreenToViewportRatio!;
        const top = viewportRectangle.top - offscreenHeight;
        const bottom = viewportRectangle.bottom + offscreenHeight;

        let sliceStart = 0;
        for (let i = sliceStart, l = rectangles.length; i < l; i++) {
            const rectangle = rectangles[i];
            if (rectangle.bottom > top) {
                break;
            }
            sliceStart = i;
        }

        let sliceEnd = sliceStart + 1;
        for (let i = sliceEnd, l = rectangles.length; i < l; i++) {
            const rectangle = rectangles[i];
            if (rectangle.top >= bottom) {
                break;
            }
            sliceEnd = i + 1;
        }

        return {
            sliceStart,
            sliceEnd
        };
    }

    private _getRelativeViewportRectangle(): ViewportRectangle {
        if (!this._ref) {
            return createViewportRectangle(0, 0, 0);
        }

        const { getViewportRectangle } = this.props;
        const rectangle = getViewportRectangle!();
        const listElement = findDOMNode(this._ref) as HTMLElement;

        const top = -listElement.getBoundingClientRect().top + rectangle.top;
        const height = rectangle.bottom - rectangle.top;

        return createViewportRectangle(top, height, rectangle.scrollOffset);
    }

    private _getScrollOffset(index: number): number {
        const viewportRectangle = this._getRelativeViewportRectangle();
        const rectangles = this._getRectangles(this.props, this._heights);

        if (index < 0 || rectangles.length === 0) {
            return 0;
        }

        const viewportTop = viewportRectangle.top + viewportRectangle.scrollOffset;

        const offset = index >= rectangles.length
            ? rectangles[rectangles.length - 1].bottom - viewportTop
            : rectangles[index].top - viewportTop;

        return Math.ceil(offset);
    }

    private _getRectangles = createSelector(
        (props: LazyListProps) => props.assumedItemHeight,
        (props: LazyListProps) => props.idAttribute,
        (props: LazyListProps) => props.items,
        (props: LazyListProps, heights: { [id: string]: number }) => heights,
        (assumedItemHeight, idAttribute, items, heights) => {
            let top = 0;

            return items.map((item) => {
                const id = item[idAttribute];
                const height = heights[id] || assumedItemHeight!;
                const rectangle = createRectangle(top, height);
                top = rectangle.bottom;
                return rectangle;
            });
        }
    );

    private _handleRef = (ref: LazyListRenderer | null): void => {
        this._ref = ref;
    }

    private _handleScroll: () => void;

    private _scheduleUpdate = createScheduledTask(
        () => this._update(),
        window.requestIdleCallback || window.requestAnimationFrame
    );
}

function createRectangle(top: number, height: number): Rectangle {
    return {
        top,
        bottom: top + height
    } as Rectangle;
}

function createViewportRectangle(top: number, height: number, scrollOffset: number): ViewportRectangle {
    return {
        top,
        bottom: top + height,
        scrollOffset
    };
}

function createScheduledTask(task: () => void, scheduler: (task: () => void) => number): () => number {
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

function getScrollAdjustmentDelta(prevPos: Positioning, nextPos: Positioning): number {
    const anchorIndex = getAnchorIndex(prevPos);

    if (nextPos.sliceStart <= anchorIndex && anchorIndex < nextPos.sliceEnd) {
        const prevId = prevPos.items[anchorIndex][prevPos.idAttribute];
        const nextId = nextPos.items[anchorIndex][nextPos.idAttribute];

        if (prevId === nextId) {
            const prevRectangle = prevPos.rectangles[anchorIndex];
            const nextRectangle = nextPos.rectangles[anchorIndex];

            const prevOffset = prevRectangle.top - prevPos.viewportRectangle.top;
            const nextOffset = nextRectangle.top - nextPos.viewportRectangle.top;

            return nextOffset > prevOffset
                ? Math.ceil(nextOffset - prevOffset)
                : Math.floor(nextOffset - prevOffset);
        }
    }

    return 0;
}

function getAnchorIndex(pos: Positioning): number {
    for (let i = pos.sliceStart; i < pos.sliceEnd; i++) {
        if (intersects(pos.rectangles[i], pos.viewportRectangle)) {
            return i;
        }
    }

    return -1;
}

function getHeightForDomNode(element: HTMLElement): number {
    return element.getBoundingClientRect().height;
}

function getViewportRectangle(): ViewportRectangle {
    return {
        top: 0,
        bottom: window.innerHeight,
        scrollOffset: 0
    };
}

function getInitialSlice(props: LazyListProps, heights: { [id: string]: number }, initialItemIndex: number): Slice {
    const { assumedItemHeight, getViewportRectangle, idAttribute, items } = props;
    const viewportRectangle = getViewportRectangle!();
    const viewportHeight = viewportRectangle.bottom - viewportRectangle.top;

    const sliceStart = Math.max(0, initialItemIndex);
    let sliceEnd = sliceStart;

    for (let i = sliceEnd + 1,
             l = items.length,
             space = viewportHeight;
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
        sliceEnd
    };
}

function intersects(first: Rectangle, second: Rectangle): boolean {
    return first.top <= second.bottom && first.bottom >= second.top;
}
