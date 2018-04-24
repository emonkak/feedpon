import React, { Component, PureComponent } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';
import { createSelector } from 'reselect';

interface LazyListRendererProps {
    assumedItemHeight?: number;
    getHeightForDomNode?: (element: HTMLElement) => number;
    getViewportRectangle?: () => Rectangle;
    idAttribute: string;
    initialHeights?: { [id: string]: number };
    initialItemIndex?: number;
    isDisabled?: boolean;
    items: any[];
    offscreenToViewportRatio?: number;
    onHeightUpdated?: (updatedHeights: { [id: string]: number }) => void;
    onPositioningUpdated?: (positioning: Positioning) => void;
    renderItem: (item: any, index: number, ref: React.Ref<React.ReactInstance>) => React.ReactElement<any>;
    renderList: (items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) => React.ReactElement<any>;
    scrollOffset?: number;
    scrollThrottleTime?: number;
}

interface LazyListRendererState {
    sliceEnd: number;
    sliceStart: number;
}

interface LazyListProps {
    blankSpaceAbove: number;
    blankSpaceBelow: number;
    getHeightForDomNode: (element: HTMLElement) => number;
    idAttribute: string;
    items: any[];
    renderItem: (item: any, index: number, ref: React.Ref<React.ReactInstance>) => React.ReactElement<any>;
    renderList: (items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) => React.ReactElement<any>;
    sliceEnd: number;
    sliceStart: number;
}

interface LazyListState {
}

export interface Positioning {
    idAttribute: string;
    items: any[];
    rectangles: Rectangle[];
    sliceEnd: number;
    sliceStart: number;
    viewportRectangle: Rectangle;
}

export interface Rectangle {
    top: number;
    bottom: number;
}

interface Slice {
    sliceEnd: number;
    sliceStart: number;
}

interface BlankSpace {
    blankSpaceAbove: number;
    blankSpaceBelow: number;
}

export default class LazyListRenderer extends Component<LazyListRendererProps, LazyListRendererState> {
    static defaultProps = {
        assumedItemHeight: 200,
        getHeightForDomNode,
        getViewportRectangle,
        initialHeights: {},
        initialItemIndex: -1,
        offscreenToViewportRatio: 1.8,
        scrollOffset: 0,
        scrollThrottleTime: 100
    };

    private _heights: { [id: string]: number } = {};

    private _prevPositioning: Positioning | null = null;

    private _ref: LazyList | null = null;

    private _scrollingItemIndex: number;

    constructor(props: LazyListRendererProps, context: any) {
        super(props, context);

        this._heights = props.initialHeights!;
        this._scrollingItemIndex = props.initialItemIndex!;

        this.state = this._getInitialSlice(props, props.initialItemIndex!);

        this._handleScroll = throttle(
            createScheduledTask(() => this._update(), window.requestAnimationFrame),
            props.scrollThrottleTime!,
            {
                trailing: true
            }
        );
    }

    componentDidMount() {
        window.addEventListener('scroll', this._handleScroll, { passive: true } as any);

        this._postRenderProcessing(true);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll, { passive: true } as any);
    }

    componentWillReceiveProps(nextProps: LazyListRendererProps) {
        const { items } = this.props;
        const nextItems = nextProps.items;

        if (items !== nextItems) {
            const { idAttribute } = this.props;
            const { idAttribute: nextIdAttribute } = nextProps;
            const { sliceStart, sliceEnd } = this.state;

            const item = items[sliceStart];
            const nextItem = nextItems[sliceStart];

            if (item && nextItem && item[idAttribute] === nextItem[nextIdAttribute]) {
                this.setState({
                    sliceStart,
                    sliceEnd: Math.min(nextItems.length, sliceEnd)
                });
            } else {
                this._reserveScrollingItemIndex(nextProps, nextProps.initialItemIndex!);
            }
        }
    }

    componentWillUpdate(nextProps: LazyListRendererProps, nextState: LazyListRendererState) {
        const viewportRectangle = this._getRelativeViewportRectangle();

        this._prevPositioning = this._getPositioning(viewportRectangle);
    }

    componentDidUpdate(prevProps: LazyListRendererProps, prevState: LazyListRendererState) {
        const hasItemsChanged = prevProps.items !== this.props.items;

        this._postRenderProcessing(hasItemsChanged);
    }

    shouldComponentUpdate(nextProps: LazyListRendererProps, nextState: LazyListRendererState) {
        const { props, state } = this;
        return props.items !== nextProps.items ||
            props.renderItem !== nextProps.renderItem ||
            props.renderList !== nextProps.renderList ||
            state.sliceEnd !== nextState.sliceEnd ||
            state.sliceStart !== nextState.sliceStart;
    }

    render() {
        const { getHeightForDomNode, idAttribute, items, renderItem, renderList } = this.props;
        const { sliceStart, sliceEnd } = this.state;
        const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace(sliceStart, sliceEnd);

        return (
            <LazyList
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
        this._reserveScrollingItemIndex(this.props, index);
    }

    private _postRenderProcessing(hasItemsChanged: boolean): void {
        const wasHeightChanged = this._recomputeHeights();

        if (this._scrollingItemIndex > -1) {
            this._setScrollPosition(this._scrollingItemIndex);
        } else if (wasHeightChanged || hasItemsChanged) {
            this._adjestScrollPosition();
            this._scheduleUpdate();
        }
    }

    private _update(): void {
        if (this.props.isDisabled) {
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
        const { assumedItemHeight, onHeightUpdated } = this.props;

        const computedHeights = this._ref ? this._ref.getItemHeights() : {};
        const updatedHeights: { [id: string]: number } = {};

        let updateCount = 0;

        for (const id in computedHeights) {
            const prevHeight = this._heights[id] || assumedItemHeight!;
            const computedHeight = computedHeights[id];

            if (prevHeight !== computedHeight) {
                updatedHeights[id] = computedHeight;
                updateCount++;
            }
        }

        if (updateCount > 0) {
            this._heights = Object.assign({}, this._heights, updatedHeights);

            if (onHeightUpdated) {
                onHeightUpdated(updatedHeights);
            }

            return true;
        }

        return false;
    }

    private _reserveScrollingItemIndex(props: LazyListRendererProps, index: number): void {
        const slice = this._getInitialSlice(props, index);
        const { sliceStart, sliceEnd } = this.state;

        if (slice.sliceStart !== sliceStart || slice.sliceEnd !== sliceEnd) {
            this._scrollingItemIndex = index;

            this.setState(slice);
        } else {
            this._setScrollPosition(index);
        }
    }

    private _setScrollPosition(index: number): void {
        const viewportRectangle = this._getRelativeViewportRectangle();
        const scrollOffset = this._getScrollOffset(index, viewportRectangle);

        if (scrollOffset !== 0) {
            window.scrollBy(0, scrollOffset);
        }

        this._scrollingItemIndex = -1;
    }

    private _adjestScrollPosition(): void {
        if (!this.props.isDisabled && this._prevPositioning) {
            const viewportRectangle = this._getRelativeViewportRectangle();
            const adjustmentDelta = getScrollAdjustmentDelta(this._prevPositioning, this._getPositioning(viewportRectangle));
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

    private _getPositioning(viewportRectangle: Rectangle): Positioning {
        const { items, idAttribute } = this.props;
        const { sliceStart, sliceEnd } = this.state;
        const rectangles = this._getRectangles(this.props, this._heights);

        return {
            idAttribute,
            items,
            rectangles,
            sliceEnd,
            sliceStart,
            viewportRectangle
        };
    }

    private _getInitialSlice(props: LazyListRendererProps, initialItemIndex: number): Slice {
        const { assumedItemHeight, getViewportRectangle, idAttribute, items } = props;
        const viewportRectangle = getViewportRectangle!();
        const maximumHeight = viewportRectangle.bottom - viewportRectangle.top;

        const sliceStart = Math.max(0, initialItemIndex);
        let sliceEnd = sliceStart;

        for (let i = sliceEnd, l = items.length, h = 0; i < l; i++) {
            const item = items[i];
            const id = item[idAttribute];
            const height = this._heights[id] || assumedItemHeight!;
            sliceEnd = i + 1;
            h += height;
            if (h >= maximumHeight) {
                break;
            }
        }

        return {
            sliceEnd,
            sliceStart
        };
    }

    private _getCurrentSlice(viewportRectangle: Rectangle): Slice {
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
            sliceStart = i;
            if (rectangle.bottom > top) {
                break;
            }
        }

        let sliceEnd = sliceStart + 1;
        for (let i = sliceEnd, l = rectangles.length; i < l; i++) {
            const rectangle = rectangles[i];
            sliceEnd = i + 1;
            if (rectangle.top >= bottom) {
                break;
            }
        }

        return {
            sliceStart,
            sliceEnd
        };
    }

    private _getRelativeViewportRectangle(): Rectangle {
        if (!this._ref) {
            return createRectangle(0, 0);
        }

        const { getViewportRectangle } = this.props;
        const rectangle = getViewportRectangle!();
        const listElement = findDOMNode(this._ref) as HTMLElement;

        const top = -listElement.getBoundingClientRect().top + rectangle.top;
        const height = rectangle.bottom - rectangle.top;

        return createRectangle(top, height);
    }

    private _getScrollOffset(index: number, viewportRectangle: Rectangle): number {
        const rectangles = this._getRectangles(this.props, this._heights);

        if (index < 0 || rectangles.length === 0) {
            return 0;
        }

        const { scrollOffset } = this.props;
        const viewportTop = viewportRectangle.top + scrollOffset!;

        const offset = index >= rectangles.length
            ? rectangles[rectangles.length - 1].bottom - viewportTop
            : rectangles[index].top - viewportTop;

        return Math.ceil(offset);
    }

    private _getRectangles = createSelector(
        (props: LazyListRendererProps) => props.assumedItemHeight,
        (props: LazyListRendererProps) => props.idAttribute,
        (props: LazyListRendererProps) => props.items,
        (props: LazyListRendererProps, heights: { [id: string]: number }) => heights,
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

    private _handleRef = (ref: LazyList | null): void => {
        this._ref = ref;
    }

    private _handleScroll: () => void;

    private _scheduleUpdate = createScheduledTask(
        () => this._update(),
        window.requestIdleCallback || window.requestAnimationFrame
    );
}

class LazyList extends PureComponent<LazyListProps, LazyListState> {
    private readonly _refs: { [id: string]: React.ReactInstance } = {};

    private readonly _refFunctions: { [id: string]: React.Ref<React.ReactInstance> } = {};

    getItemHeights(): { [id: string]: number } {
        const { getHeightForDomNode } = this.props;

        return Object.keys(this._refs).reduce<{ [id: string]: number }>((acc, id) => {
            const ref = this._refs[id];
            const element = findDOMNode(ref) as HTMLElement;
            acc[id] = getHeightForDomNode(element);
            return acc;
        }, {});
    }

    render() {
        const { renderList, blankSpaceAbove, blankSpaceBelow } = this.props;

        return renderList(this._renderItems(), blankSpaceAbove, blankSpaceBelow);
    }

    private _renderItems(): React.ReactElement<any>[] {
        const { idAttribute, items, renderItem, sliceEnd, sliceStart } = this.props;

        const elements: React.ReactElement<any>[] = [];

        for (let i = sliceStart; i < sliceEnd; i++) {
            const item = items[i];
            const id = item[idAttribute];

            let ref: React.Ref<React.ReactInstance>;

            if (this._refFunctions[id] != null) {
                ref = this._refFunctions[id]!;
            } else {
                ref = this._refFunctions[id] = (instance: React.ReactInstance) => {
                    if (instance) {
                        this._refs[id] = instance;
                    } else {
                        delete this._refs[id];
                        delete this._refFunctions[id];
                    }
                };
            }

            const element = renderItem(item, i, ref);

            elements.push(element);
        }

        return elements;
    }
}

function createRectangle(top: number, height: number): Rectangle {
    return {
        top,
        bottom: top + height
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
    let anchorIndex = -1;

    for (let i = prevPos.sliceStart; i < prevPos.sliceEnd; i++) {
        if (intersects(prevPos.rectangles[i], prevPos.viewportRectangle)) {
            anchorIndex = i;
            break;
        }
    }

    if (nextPos.sliceStart <= anchorIndex && anchorIndex < nextPos.sliceEnd) {
        const prevId = prevPos.items[anchorIndex][prevPos.idAttribute];
        const nextId = nextPos.items[anchorIndex][nextPos.idAttribute];

        if (prevId === nextId) {
            const prevRectangle = prevPos.rectangles[anchorIndex];
            const nextRectangle = nextPos.rectangles[anchorIndex];

            const prevOffset = prevRectangle.top;
            const nextOffset = nextRectangle.top;

            return nextOffset > prevOffset
                ? Math.ceil(nextOffset - prevOffset)
                : Math.floor(nextOffset - prevOffset);
        }
    }

    return 0;
}

function getHeightForDomNode(element: HTMLElement): number {
    return element.getBoundingClientRect().height;
}

function getViewportRectangle(): Rectangle {
    return {
        top: 0,
        bottom: window.innerHeight
    };
}

function intersects(first: Rectangle, second: Rectangle): boolean {
    return first.top <= second.bottom && first.bottom >= second.top;
}
