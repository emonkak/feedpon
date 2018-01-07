import React, { Component, PureComponent, cloneElement } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

interface LazyListRendererProps {
    assumedItemHeight?: number;
    getHeightForDomNode?: (element: HTMLElement) => number;
    idAttribute: string;
    initialHeights?: { [id: string]: number };
    initialItemIndex?: number;
    items: any[];
    offscreenToViewportRatio?: number;
    onHeightChanged?: (heights: { [id: string]: number }, prevHeights: { [id: string]: number }) => void;
    onPositioning?: (positioning: Positioning) => void;
    renderItem: (item: any, index: number) => React.ReactElement<any>;
    renderList: (items: React.ReactElement<any>[], blankSpaceAbove: number, blankSpaceBelow: number) => React.ReactElement<any>;
    scrollThrottleTime?: number;
}

interface LazyListRendererState {
    blankSpaceAbove: number;
    blankSpaceBelow: number;
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

export interface Rectangle {
    top: number;
    bottom: number;
}

export interface Positioning {
    idAttribute: string;
    items: any[];
    rectangles: Rectangle[];
    sliceEnd: number;
    sliceStart: number;
    viewportRectangle: Rectangle;
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
        initialItemIndex: 0,
        offscreenToViewportRatio: 1.8,
        scrollThrottleTime: 100
    };

    private readonly _handleScroll: () => void;

    private readonly _handleRef = (ref: LazyList | null) => {
        this._ref = ref;
    };

    private readonly _scheduleUpdate = createScheduledTask(
        () => this._update(),
        window.requestIdleCallback || window.requestAnimationFrame
    );

    private _heights: { [id: string]: number };

    private _rectangles: Rectangle[];

    private _prevPositioning: Positioning | null = null;

    private _ref: LazyList | null = null;

    private _isUnmounted: boolean = false;

    constructor(props: LazyListRendererProps, context: any) {
        super(props, context);

        this._heights = props.initialHeights || {};
        this._rectangles = this._computeRectangles();

        const { sliceStart, sliceEnd } = this._getDefaultSlice(props.items);
        const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace(sliceStart, sliceEnd);

        this.state = {
            sliceStart,
            sliceEnd,
            blankSpaceAbove,
            blankSpaceBelow
        };

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

        window.removeEventListener('scroll', this._handleScroll);
    }

    componentWillReceiveProps(nextProps: LazyListRendererProps) {
        const { items } = this.props;

        const nextItems = nextProps.items;
        if (nextItems !== items) {
            const { sliceStart, sliceEnd } = this._computeNextSlice(items, nextItems);
            const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace(sliceStart, sliceEnd);

            this.setState({
                sliceStart,
                sliceEnd,
                blankSpaceAbove,
                blankSpaceBelow
            });
        }
    }

    componentWillUpdate() {
        this._prevPositioning = this._getPositioning();
    }

    componentDidUpdate(prevProps: LazyListRendererProps) {
        this._postRenderProcessing(prevProps.items !== this.props.items);
    }

    shouldComponentUpdate(nextProps: LazyListRendererProps, nextState: LazyListRendererState) {
        const { props, state } = this;
        return props.items !== nextProps.items ||
            props.renderItem !== nextProps.renderItem ||
            props.renderList !== nextProps.renderList ||
            state.blankSpaceAbove !== nextState.blankSpaceAbove ||
            state.blankSpaceBelow !== nextState.blankSpaceBelow ||
            state.sliceEnd !== nextState.sliceEnd ||
            state.sliceStart !== nextState.sliceStart;
    }

    getScrollPosition(index: number): number {
        const rectangle = this._rectangles[index];
        if (!rectangle || !this._ref) {
            return 0;
        }
        const listElement = findDOMNode(this._ref) as HTMLElement;
        const listTop = getTopFromRoot(listElement);
        const scrollY = listTop + rectangle.top;
        return Math.ceil(scrollY);
    }

    render() {
        const { getHeightForDomNode, idAttribute, items, renderItem, renderList } = this.props;
        const { blankSpaceAbove, blankSpaceBelow, sliceEnd, sliceStart } = this.state;

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

    private _postRenderProcessing(hasItemsChanged: boolean): void {
        const wasHeightChanged = this._recomputeHeights();

        if (wasHeightChanged || hasItemsChanged) {
            this._rectangles = this._computeRectangles();

            if (this._prevPositioning) {
                const scrollAdjustment = getScrollAdjustment(this._prevPositioning, this._getPositioning());
                if (scrollAdjustment !== 0) {
                    window.scrollBy(0, scrollAdjustment);
                }
            }

            this._scheduleUpdate();
        }

        this._notifyPositioning();
    }

    private _update(): void {
        if (!this._isUnmounted) {
            const { sliceStart, sliceEnd } = this._computeCurrentSlice();
            const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace(sliceStart, sliceEnd);

            this._notifyPositioning();

            this.setState({
                sliceEnd,
                sliceStart,
                blankSpaceAbove,
                blankSpaceBelow
            });
        }
    }

    private _notifyPositioning(): void {
        if (this.props.onPositioning) {
            this.props.onPositioning(this._getPositioning());
        }
    }

    private _recomputeHeights(): boolean {
        const { assumedItemHeight, onHeightChanged } = this.props;
        const heights = this._heights;
        const computedHeights = this._ref ? this._ref.computeItemHeights() : {};

        for (const id in computedHeights) {
            const prevHeight = heights.hasOwnProperty(id) ? heights[id] : assumedItemHeight!;
            const currentHeight = computedHeights[id];

            if (prevHeight !== currentHeight) {
                this._heights = Object.assign({}, heights, computedHeights);

                if (onHeightChanged) {
                    onHeightChanged(this._heights, heights);
                }

                return true;
            }
        }

        return false;
    }

    private _computeRectangles(): Rectangle[] {
        const { assumedItemHeight, idAttribute, items } = this.props;
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

    private _computeBlankSpace(sliceStart: number, sliceEnd: number): BlankSpace {
        const rectangles = this._rectangles;

        const blankSpaceAbove = sliceStart < rectangles.length ?
            rectangles[sliceStart].top :
            0;
        const blankSpaceBelow = rectangles.length > 0 && sliceEnd < rectangles.length ?
            rectangles[rectangles.length - 1].bottom - rectangles[sliceEnd].top :
            0;

        return {
            blankSpaceAbove,
            blankSpaceBelow
        };
    }

    private _computeCurrentSlice(): Slice {
        const { offscreenToViewportRatio } = this.props;
        const rectangles = this._rectangles;

        if (rectangles.length === 0) {
            return {
                sliceStart: 0,
                sliceEnd: 0
            };
        }

        const viewportRectangle = this._getRelativeViewportRectangle();
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

    private _computeNextSlice(items: any[], nextItems: any[]): Slice {
        const { idAttribute } = this.props;
        const { sliceStart, sliceEnd } = this.state;

        const nextItemsIndexes = nextItems.reduce<{ [id: string]: number }>((acc, item, index) => {
            const id = item[idAttribute];
            acc[id] = index;
            return acc;
        }, {});

        const newSliceStartItem = findNearestIndexItem(items, sliceStart, (item) => {
            const id = item[idAttribute];
            return nextItemsIndexes.hasOwnProperty(id);
        });
        if (newSliceStartItem === null) {
            return this._getDefaultSlice(nextItems);
        }

        const newSliceStart = nextItemsIndexes[newSliceStartItem[idAttribute]];
        return {
            sliceStart: newSliceStart,
            sliceEnd: Math.min(nextItems.length, newSliceStart + sliceEnd - sliceStart)
        };
    }

    private _getDefaultSlice(items: any[]): Slice {
        const { assumedItemHeight, initialItemIndex } = this.props;
        const numItemsInViewport = Math.ceil(window.innerHeight / assumedItemHeight!);

        return {
            sliceStart: initialItemIndex!,
            sliceEnd: Math.min(items.length, initialItemIndex! + numItemsInViewport)
        };
    }

    private _getPositioning(): Positioning {
        const { idAttribute } = this.props;
        const { sliceStart, sliceEnd } = this.state;

        return {
            idAttribute,
            items: this.props.items,
            rectangles: this._rectangles,
            sliceEnd,
            sliceStart,
            viewportRectangle: this._getRelativeViewportRectangle()
        };
    }

    private _getRelativeViewportRectangle(): Rectangle {
        if (!this._ref) {
            return createRectangle(0, 0);
        }
        const listElement = findDOMNode(this._ref) as HTMLElement;
        const top = -listElement.getBoundingClientRect().top;
        return createRectangle(top, window.innerHeight);
    }
}

class LazyList extends PureComponent<LazyListProps, LazyListState> {
    private readonly _refs: { [id: string]: React.ReactInstance } = {};

    computeItemHeights(): { [id: string]: number } {
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

function getScrollAdjustment(prevPos: Positioning, nextPos: Positioning): number {
    const nextRenderedIndexes: { [id: string]: number } = {};

    for (let index = nextPos.sliceStart; index < nextPos.sliceEnd; index++) {
        const item = nextPos.items[index];
        const id = item[nextPos.idAttribute];
        nextRenderedIndexes[id] = index;
    }

    for (let index = prevPos.sliceStart; index < prevPos.sliceEnd; index++) {
        const item = prevPos.items[index];
        const id = item[prevPos.idAttribute];

        if (nextRenderedIndexes.hasOwnProperty(id) && nextRenderedIndexes[id] === index) {
            const prevRectangle = prevPos.rectangles[index];
            const nextRectangle = nextPos.rectangles[index];

            const prevTop = prevRectangle.top - prevPos.viewportRectangle.top;
            const nextTop = nextRectangle.top - nextPos.viewportRectangle.top;

            return nextTop - prevTop;
        }
    }

    return 0;
}

function getHeightForDomNode(element: HTMLElement): number {
    return element.getBoundingClientRect().height;
}

function getTopFromRoot(element: HTMLElement): number {
    let top = 0;
    for (let target = element; target !== null; target = target.offsetParent as HTMLElement) {
        top += target.offsetTop;
    }
    return top;
}

function findNearestIndexItem<T>(items: T[], initialIndex: number, predicate: (item: T) => boolean): T | null {
    if (initialIndex < 0 || initialIndex >= items.length) {
        return null;
    }

    if (predicate(items[initialIndex])) {
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
