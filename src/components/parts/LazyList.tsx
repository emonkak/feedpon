import React, { cloneElement, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import createChainedFunction from 'utils/createChainedFunction';
import throttleEventHandler from 'utils/throttleEventHandler';
import throttleAnimationFrame from 'utils/throttleAnimationFrame';

interface LazyListProps {
    assumedItemHeight: number;
    getHeight?: (element: HTMLElement) => number;
    getKey: (item: any) => string | number;
    getScrollableParent?: (element: Element) => Element | Window;
    items: any[];
    offscreenToViewportRatio?: number;
    renderItem: (item: any, index: number) => React.ReactElement<any>;
    renderList: (children: React.ReactNode, aboveSpace: number, belowSpace: number) => React.ReactElement<any>;
    scrollThrottleTime?: number;
}

interface LazyListState {
    aboveSpace: number;
    belowSpace: number;
    startIndex: number;
    endIndex: number;
}

export default class LazyList extends PureComponent<LazyListProps, LazyListState> {
    static defaultProps = {
        getScrollableParent: (element: Element) => window,
        getHeight: (element: HTMLElement) => element.offsetHeight,
        offscreenToViewportRatio: 1.0,
        scrollThrottleTime: 100
    };

    private readonly elements: { [key: string]: HTMLElement } = {};

    private heights: { [key: string]: number } = {};

    private scrollable: Element | Window;

    private heightChanged = false;

    constructor(props: LazyListProps, context: any) {
        super(props, context);

        this.state = {
            aboveSpace: 0,
            belowSpace: 0,
            startIndex: 0,
            endIndex: 0
        };

        this.handleScroll = throttleEventHandler(throttleAnimationFrame(this.handleScroll.bind(this)), props.scrollThrottleTime!);
        this.handleUpdateHeight = throttleAnimationFrame(this.handleUpdateHeight.bind(this));
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent!(findDOMNode(this));
        this.scrollable.addEventListener('resize', this.handleUpdateHeight, { passive: true } as any);
        this.scrollable.addEventListener('scroll', this.handleScroll, { passive: true } as any);
        this.scrollable.addEventListener('touchmove', this.handleScroll, { passive: true } as any);

        this.handleUpdateHeight();
    }

    componentDidUpdate(prevProps: LazyListProps, prevState: LazyListState) {
        if (this.props.items !== prevProps.items
            || this.state.startIndex !== prevState.startIndex
            || this.state.endIndex !== prevState.endIndex) {
            this.handleUpdateHeight();
        }
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('resize', this.handleUpdateHeight);
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
    }

    getScrollRect() {
        let scrollTop = 0;
        let scrollHeight = 0;

        if (this.scrollable instanceof Element) {
            scrollTop = this.scrollable.scrollTop!;
            scrollHeight = this.scrollable.clientHeight;
        } else if (this.scrollable instanceof Window) {
            scrollTop = this.scrollable.scrollY;
            scrollHeight = this.scrollable.innerHeight;
        }

        return { scrollTop, scrollHeight };
    }

    updateHeights() {
        const { assumedItemHeight, getHeight, getKey, items } = this.props;

        let heights: { [key: string]: number } = {};
        let hasChanged = false;

        for (const item of items) {
            const key = getKey(item);

            const height = this.elements[key]
                ? getHeight!(this.elements[key])
                : this.heights[key] || assumedItemHeight;

            heights[key] = height;

            if (height !== this.heights[key]) {
                hasChanged = true;
            }
        }

        this.heights = heights;
        this.heightChanged = hasChanged;

        return hasChanged;
    }

    updateScrollPosition() {
        const { assumedItemHeight, getKey, items, offscreenToViewportRatio } = this.props;
        const { scrollTop, scrollHeight } = this.getScrollRect();

        const effectiveTop = scrollTop - (scrollHeight * offscreenToViewportRatio!);
        const effectiveBottom = scrollTop + scrollHeight + (scrollHeight * offscreenToViewportRatio!);

        let aboveSpace = 0;
        let belowSpace = 0;
        let startIndex = 0;
        let endIndex = 0;
        let currentTop = findDOMNode<HTMLElement>(this).offsetTop;

        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]!;
            const key = getKey(item);
            const height = this.heights[key] || assumedItemHeight;
            const currentBottom = currentTop + height;

            if (currentTop <= effectiveBottom && currentBottom >= effectiveTop) {
                if (endIndex === 0) {
                    startIndex = i;
                }

                endIndex = i + 1;
            } else {
                if (endIndex === 0) {
                    aboveSpace += height;
                } else {
                    belowSpace += height;
                }
            }

            currentTop = currentBottom;
        }

        this.setState({
            aboveSpace,
            belowSpace,
            startIndex,
            endIndex
        });
    }

    handleScroll(event: Event) {
        if (this.heightChanged) {
            this.heightChanged = false;
            return;
        }

        this.updateScrollPosition();
    }

    handleUpdateHeight() {
        if (this.updateHeights()) {
            this.updateScrollPosition();
        }
    }

    renderItem(item: any, index: number): React.ReactElement<any> {
        const { getKey, renderItem } = this.props;
        const { startIndex } = this.state;

        const child = renderItem(item, index + startIndex);
        const key = getKey(item);

        const ref = (child: React.ReactInstance) => {
            if (child) {
                this.elements[key] = findDOMNode<HTMLElement>(child);
            } else {
                delete this.elements[key];
            }
        };

        return cloneElement(child, {
            ...child.props,
            ref: createChainedFunction((child as any).ref, ref)
        });
    }

    render() {
        const { items, renderList } = this.props;
        const { aboveSpace, belowSpace, endIndex, startIndex } = this.state;

        return renderList(
            items.slice(startIndex, endIndex).map(this.renderItem.bind(this)),
            aboveSpace,
            belowSpace
        );
    }
}
