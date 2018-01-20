import React, { Component, PureComponent, cloneElement } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

interface LazyListRendererProps {
    assumedItemHeight?: number;
    getHeightForDomNode?: (element: HTMLElement) => number;
    getViewportRectangle?: () => Rectangle;
    idAttribute: string;
    initialHeights?: { [id: string]: number };
    initialItemIndex?: number;
    items: any[];
    offscreenToViewportRatio?: number;
    onHeightUpdated?: (heights: { [id: string]: number }, prevHeights: { [id: string]: number }) => void;
    onPositioningUpdated?: (positioning: Positioning) => void;
    renderItem: (item: any, index: number) => React.ReactElement<any>;
    renderList: (items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) => React.ReactElement<any>;
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
    renderItem: (item: any, index: number) => React.ReactElement<any>;
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
    shouldRestoreScrollPosition: boolean;
    sliceEnd: number;
    sliceStart: number;
}

interface BlankSpace {
    blankSpaceAbove: number;
    blankSpaceBelow: number;
}

interface Scrolling {
    index: number;
    callback?: (index: number) => void;
}

export default class LazyListRenderer extends Component<LazyListRendererProps, LazyListRendererState> {
    static defaultProps = {
        assumedItemHeight: 200,
        getHeightForDomNode,
        getViewportRectangle,
        initialItemIndex: 0,
        offscreenToViewportRatio: 1.8,
        scrollThrottleTime: 100
    };

    private _heights: { [id: string]: number };

    private _rectangles: Rectangle[];

    private _prevPositioning: Positioning | null = null;

    private _ref: LazyList | null = null;

    private _isUnmounted: boolean = false;

    private _scheduledScrolling: Scrolling | null = null;

    private _shouldRestoreScrollPosition: boolean = false;

    constructor(props: LazyListRendererProps, context: any) {
        super(props, context);

        this._heights = props.initialHeights || {};
        this._rectangles = this._getRectangles(props);

        this.state = this._getInitialSlice(props);

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
        this._isUnmounted = true;

        window.removeEventListener('scroll', this._handleScroll, { passive: true } as any);
    }

    componentWillReceiveProps(nextProps: LazyListRendererProps) {
        const { items } = this.props;
        const nextItems = nextProps.items;

        if (items !== nextItems) {
            const { idAttribute, initialHeights } = nextProps;

            this._heights = nextItems.reduce<{ [id: string]: number }>((acc, item) => {
                const id = item[idAttribute];
                if (this._heights.hasOwnProperty(id)) {
                    acc[id] = this._heights[id];
                }
                return acc;
            }, Object.assign({}, initialHeights));

            this._rectangles = this._getRectangles(nextProps);

            const { shouldRestoreScrollPosition, sliceStart, sliceEnd } = this._getNextSlice(this.props, nextProps);

            if (shouldRestoreScrollPosition) {
                this._shouldRestoreScrollPosition = true;
            }

            this.setState({ sliceStart, sliceEnd });
        }
    }

    componentWillUpdate(nextProps: LazyListRendererProps, nextState: LazyListRendererState) {
        const viewportRectangle = this._getRelativeViewportRectangle();

        this._prevPositioning = this._getPositioning(viewportRectangle);
    }

    componentDidUpdate(prevProps: LazyListRendererProps, prevState: LazyListRendererState) {
        this._postRenderProcessing(prevProps.items !== this.props.items);
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

    scrollToIndex(index: number, callback?: (index: number) => void): void {
        this._scheduledScrolling = { index, callback };
        this._scheduleScrolling();
    }

    private _postRenderProcessing(hasItemsChanged: boolean): void {
        const wasHeightChanged = this._recomputeHeights();

        if (wasHeightChanged || hasItemsChanged) {
            this._rectangles = this._getRectangles(this.props);
            this._adjestScrollPosition();
            this._scheduleUpdate();
        }
    }

    private _restoreScrollPosition(index: number): void {
        if (index === 0) {
            window.scrollTo(0, 0);
        } else {
            const viewportRectangle = this._getRelativeViewportRectangle();
            const scrollOffset = this._getScrollOffset(index, viewportRectangle);

            if (scrollOffset !== 0) {
                window.scrollBy(0, scrollOffset);
            }
        }
    }

    private _update(): void {
        if (this._isUnmounted) {
            return;
        }

        const viewportRectangle = this._getRelativeViewportRectangle();

        if (this._scheduledScrolling) {
            this._scheduleScrolling();
        } else {
            const { onPositioningUpdated } = this.props;
            if (onPositioningUpdated) {
                onPositioningUpdated(this._getPositioning(viewportRectangle));
            }
        }

        const { shouldRestoreScrollPosition, sliceEnd, sliceStart } = this._getCurrentSlice(viewportRectangle);

        if (shouldRestoreScrollPosition) {
            this._shouldRestoreScrollPosition = true;
        }

        this.setState({ sliceStart, sliceEnd });
    }

    private _recomputeHeights(): boolean {
        const { assumedItemHeight, onHeightUpdated } = this.props;
        const heights = this._heights;
        const currentHeights = this._ref ? this._ref.getItemHeights() : {};

        for (const id in currentHeights) {
            const prevHeight = heights.hasOwnProperty(id) ? heights[id] : assumedItemHeight!;
            const currentHeight = currentHeights[id];

            if (prevHeight !== currentHeight) {
                this._heights = Object.assign({}, heights, currentHeights);

                if (onHeightUpdated) {
                    onHeightUpdated(this._heights, heights);
                }

                return true;
            }
        }

        return false;
    }

    private _computeBlankSpace(sliceStart: number, sliceEnd: number): BlankSpace {
        const rectangles = this._rectangles;

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

    private _adjestScrollPosition(): void {
        if (this._shouldRestoreScrollPosition) {
            this._restoreScrollPosition(this.state.sliceStart);
            this._shouldRestoreScrollPosition = false;
        } else {
            if (this._prevPositioning) {
                const viewportRectangle = this._getRelativeViewportRectangle();
                const adjustmentDelta = getScrollAdjustmentDelta(this._prevPositioning, this._getPositioning(viewportRectangle));
                if (adjustmentDelta !== 0) {
                    window.scrollBy(0, adjustmentDelta);
                }
            }
        }
    }

    private _getPositioning(viewportRectangle: Rectangle): Positioning {
        const { idAttribute } = this.props;
        const { sliceStart, sliceEnd } = this.state;

        return {
            idAttribute,
            items: this.props.items,
            rectangles: this._rectangles,
            sliceEnd,
            sliceStart,
            viewportRectangle
        };
    }

    private _getInitialSlice(props: LazyListRendererProps): Slice {
        const { assumedItemHeight, getViewportRectangle, idAttribute, initialItemIndex, items } = props;
        const heights = this._heights;
        const viewportRectangle = getViewportRectangle!();
        const maximumHeight = viewportRectangle.bottom - viewportRectangle.top;

        const sliceStart = initialItemIndex!;
        let sliceEnd = initialItemIndex!;

        for (let i = sliceEnd, l = items.length, h = 0; i < l; i++) {
            const item = items[i];
            const id = item[idAttribute];
            const height = heights.hasOwnProperty(id) ? heights[id] : assumedItemHeight!;
            sliceEnd = i + 1;
            h += height;
            if (h >= maximumHeight) {
                break;
            }
        }

        return {
            shouldRestoreScrollPosition: true,
            sliceEnd,
            sliceStart
        };
    }

    private _getNextSlice(props: LazyListRendererProps, nextProps: LazyListRendererProps): Slice {
        const { idAttribute, items } = props;
        const { idAttribute: nextIdAttribute, items: nextItems } = nextProps;
        const { sliceStart, sliceEnd } = this.state;

        const nextItemIndexes = nextItems.reduce<{ [id: string]: number }>((acc, item, index) => {
            const id = item[nextIdAttribute];
            acc[id] = index;
            return acc;
        }, {});

        const newSliceStartItem = findNearestIndexItem(items, sliceStart, (item) => {
            const id = item[idAttribute];
            return nextItemIndexes.hasOwnProperty(id);
        });
        if (newSliceStartItem === null) {
            return this._getInitialSlice(nextProps);
        }

        const newSliceStartId = newSliceStartItem[idAttribute];
        const newSliceStart = nextItemIndexes[newSliceStartId];

        return {
            shouldRestoreScrollPosition: newSliceStart !== sliceStart,
            sliceStart: newSliceStart,
            sliceEnd: Math.min(nextItems.length, newSliceStart + sliceEnd - sliceStart)
        };
    }

    private _getCurrentSlice(viewportRectangle: Rectangle): Slice {
        const rectangles = this._rectangles;
        if (rectangles.length === 0) {
            return {
                shouldRestoreScrollPosition: false,
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
            shouldRestoreScrollPosition: false,
            sliceStart,
            sliceEnd
        };
    }

    private _getRelativeViewportRectangle(): Rectangle {
        if (!this._ref) {
            return createRectangle(0, 0);
        }
        const rectangle = this.props.getViewportRectangle!();
        const listElement = findDOMNode(this._ref) as HTMLElement;
        const top = -listElement.getBoundingClientRect().top + rectangle.top;
        const bottom = top + (rectangle.bottom - rectangle.top);
        return createRectangle(top, bottom);
    }

    private _getScrollOffset(index: number, viewportRectangle: Rectangle): number {
        const rectangles = this._rectangles;

        if (index < 0 || rectangles.length === 0 || !this._ref) {
            return 0;
        }

        if (index >= rectangles.length) {
            return Math.ceil(rectangles[rectangles.length - 1].bottom - viewportRectangle.top);
        }

        return Math.ceil(rectangles[index].top - viewportRectangle.top);
    }

    private _getRectangles(props: LazyListRendererProps): Rectangle[] {
        const { assumedItemHeight, idAttribute, items } = props;
        const heights = this._heights;

        let top = 0;

        return items.map((item) => {
            const id = item[idAttribute];
            const height = heights.hasOwnProperty(id) ? heights[id] : assumedItemHeight!;
            const rectangle = createRectangle(top, height);
            top = rectangle.bottom;
            return rectangle;
        });
    }

    private _scheduleUpdate = createScheduledTask(
        () => this._update(),
        window.requestIdleCallback || window.requestAnimationFrame
    );

    private _scheduleScrolling = createScheduledTask(
        () => {
            if (this._scheduledScrolling === null) {
                return;
            }

            const { index, callback } = this._scheduledScrolling;
            const viewportRectangle = this._getRelativeViewportRectangle();
            const scrollOffset = this._getScrollOffset(index, viewportRectangle);

            if (scrollOffset === 0) {
                this._scheduledScrolling = null;

                if (callback) {
                    callback(index);
                }
            } else {
                window.scrollBy(0, scrollOffset);
            }
        },
        window.requestAnimationFrame
    );

    private _handleRef = (ref: LazyList | null): void => {
        this._ref = ref;
    }

    private _handleScroll: () => void;
}

class LazyList extends PureComponent<LazyListProps, LazyListState> {
    private readonly _refs: { [id: string]: React.ReactInstance } = {};

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
            const element = renderItem(item, i);

            const originalRef = (element as any).ref;
            const ref = (instance: React.ReactInstance) => {
                if (instance) {
                    this._refs[id] = instance;
                } else {
                    delete this._refs[id];
                }
                if (originalRef) {
                    originalRef(instance);
                }
            };

            elements.push(cloneElement(element, { ref }));
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
    const nextRenderedIndexes: { [id: string]: number } = {};

    for (let i = nextPos.sliceStart; i < nextPos.sliceEnd; i++) {
        const item = nextPos.items[i];
        const id = item[nextPos.idAttribute];

        nextRenderedIndexes[id] = i;
    }

    for (let i = prevPos.sliceStart; i < prevPos.sliceEnd; i++) {
        const item = prevPos.items[i];
        const id = item[prevPos.idAttribute];

        if (nextRenderedIndexes.hasOwnProperty(id) && nextRenderedIndexes[id] === i) {
            const prevRectangle = prevPos.rectangles[i];
            const nextRectangle = nextPos.rectangles[i];

            const prevTop = prevRectangle.top - prevPos.viewportRectangle.top;
            const nextTop = nextRectangle.top - nextPos.viewportRectangle.top;

            return Math.ceil(nextTop - prevTop);
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

function findNearestIndexItem<T>(items: T[], initialIndex: number, predicate: (item: T) => boolean): T | null {
    if (0 <= initialIndex &&
        initialIndex < items.length &&
        predicate(items[initialIndex])) {
        return items[initialIndex];
    }

    for (
        let i = initialIndex - 1, j = initialIndex + 1, l = items.length;
        i >= 0 || j < l;
        i -= 1, j += 1
    ) {
        if (i >= 0 && predicate(items[i])) {
            return items[i];
        }
        if (j < l && predicate(items[j])) {
            return items[j];
        }
    }

    return null;
}
