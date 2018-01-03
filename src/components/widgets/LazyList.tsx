import React, { cloneElement, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import createChainedFunction from 'utils/createChainedFunction';
import getScrollableParent from 'utils/dom/getScrollableParent';
import throttle from 'lodash.throttle';
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
        getScrollableParent,
        getHeight: (element: HTMLElement) => element.offsetHeight,
        offscreenToViewportRatio: 1.0,
        scrollThrottleTime: 100
    };

    private readonly itemElements: { [key: string]: HTMLElement } = {};

    private itemHeights: { [key: string]: number } = {};

    private containerElement: HTMLElement;

    private scrollable: Element | Window | null = null;

    constructor(props: LazyListProps, context: any) {
        super(props, context);

        this.state = {
            aboveSpace: 0,
            belowSpace: 0,
            startIndex: 0,
            endIndex: 0
        };

        this.handleScroll = throttle(throttleAnimationFrame(this.handleScroll.bind(this)), props.scrollThrottleTime!);
        this.handleUpdateHeight = throttleAnimationFrame(this.handleUpdateHeight.bind(this));
    }

    componentDidMount() {
        this.containerElement = findDOMNode(this) as HTMLElement;

        this.scrollable = this.props.getScrollableParent!(this.containerElement);
        this.scrollable.addEventListener('resize', this.handleUpdateHeight, { passive: true } as any);
        this.scrollable.addEventListener('scroll', this.handleScroll, { passive: true } as any);

        this.updateScrollPosition();
    }

    componentDidUpdate(prevProps: LazyListProps, prevState: LazyListState) {
        if (this.props.items !== prevProps.items) {
            this.refreshHeights();
            this.recalclateHeights();
            this.updateScrollPosition();
        }
    }

    componentWillUnmount() {
        if (this.scrollable) {
            this.scrollable.removeEventListener('resize', this.handleUpdateHeight, { passive: true } as any);
            this.scrollable.removeEventListener('scroll', this.handleScroll, { passive: true } as any);
            this.scrollable = null;
        }
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

    refreshHeights() {
        const { getKey, items } = this.props;

        this.itemHeights = items.reduce((acc, item) => {
            const key = getKey(item);

            if (this.itemHeights[key]) {
                acc[key] = this.itemHeights[key];
            }

            return acc;
        }, {});
    }

    recalclateHeights() {
        const { getHeight } = this.props;

        for (const key in this.itemElements) {
            this.itemHeights[key] = getHeight!(this.itemElements[key]);
        }
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
        let currentTop = this.containerElement.offsetTop;

        for (let i = 0, l = items.length; i < l; i++) {
            const item = items[i]!;
            const key = getKey(item);
            const height = this.itemHeights[key] || assumedItemHeight;
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
        if (!this.scrollable) {
            return;
        }
        this.updateScrollPosition();
    }

    handleUpdateHeight() {
        if (!this.scrollable) {
            return;
        }
        this.recalclateHeights();
        this.updateScrollPosition();
    }

    renderItem(item: any, index: number): React.ReactElement<any> {
        const { getHeight, getKey, renderItem } = this.props;

        const key = getKey(item);
        const child = renderItem(item, index);

        const ref = (instance: React.ReactInstance) => {
            if (instance) {
                const element = findDOMNode(instance) as HTMLElement;
                this.itemElements[key] = element;
                this.itemHeights[key] = getHeight!(element);
            } else {
                delete this.itemElements[key];
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
            items.slice(startIndex, endIndex).map((item, index) => this.renderItem(item, index + startIndex)),
            aboveSpace,
            belowSpace
        );
    }
}
