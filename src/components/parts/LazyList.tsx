import React, { cloneElement, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import createChainedFunction from 'utils/createChainedFunction';
import throttleEventHandler from 'utils/throttleEventHandler';
import throttleAnimationFrame from 'utils/throttleAnimationFrame';

interface LazyListProps {
    assumeHeight?: number;
    getHeight?: (element: Element) => number;
    getKey: (item: any) => string;
    getScrollableParent: (element: Element) => Element | Window;
    items: any[];
    offscreenToViewportRatio?: number;
    renderItem: (item: any) => React.ReactElement<any>;
    renderList: (items: React.ReactNode, aboveSpace: number, belowSpace: number) => React.ReactElement<any>;
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
        assumeHeight: 200,
        getHeight: (element: Element) => element.getBoundingClientRect().height,
        offscreenToViewportRatio: 1.0,
        scrollThrottleTime: 100
    };

    private readonly elements: {[key: string]: HTMLElement} = {};

    private heights: {[key: string]: number} = {};

    private scrollable: Element | Window;

    constructor(props: LazyListProps, context: any) {
        super(props, context);

        this.state = {
            aboveSpace: 0,
            belowSpace: 0,
            startIndex: 0,
            endIndex: 0
        };

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime!);
        this.handleHeightChanged = throttleAnimationFrame(this.handleHeightChanged.bind(this));
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent(findDOMNode(this));
        this.scrollable.addEventListener('resize', this.handleHeightChanged, { passive: true } as any);
        this.scrollable.addEventListener('scroll', this.handleScroll, { passive: true } as any);
        this.scrollable.addEventListener('touchmove', this.handleScroll, { passive: true } as any);

        this.handleHeightChanged();
    }

    componentDidUpdate(prevProps: LazyListProps, prevState: LazyListState) {
        if (this.props.items !== prevProps.items
            || this.state.startIndex !== prevState.startIndex
            || this.state.endIndex !== prevState.endIndex) {
            this.handleHeightChanged();
        }
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('resize', this.handleHeightChanged);
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
    }

    getScrollRectangle() {
        let scrollTop = 0;
        let scrollHeight = 0;

        if (this.scrollable instanceof Element) {
            scrollTop = this.scrollable.scrollTop!;
            scrollHeight = this.scrollable.clientHeight;
        } else if (this.scrollable instanceof Window) {
            scrollTop = this.scrollable.scrollY;
            scrollHeight = this.scrollable.innerHeight;
        }

        return { scrollTop, scrollBottom: scrollTop + scrollHeight, scrollHeight };
    }

    updateHeights() {
        const { assumeHeight, getHeight, getKey, items } = this.props;

        let isChanged = false;

        this.heights = items.reduce((result, item) => {
            const key = getKey(item);

            if (this.elements[key]) {
                const height = this.heights[key] || assumeHeight;
                const actualHeight = getHeight!(this.elements[key]);

                result[key] = actualHeight;

                if (height !== actualHeight) {
                    isChanged = true;
                }
            } else if (this.heights[key]) {
                result[key] = this.heights[key];
            } else {
                result[key] = assumeHeight;
                isChanged = true;
            }

            return result;
        }, {});

        return isChanged;
    }

    updateScrollPosition() {
        const { assumeHeight, getKey, items, offscreenToViewportRatio } = this.props;
        const { scrollTop, scrollBottom, scrollHeight } = this.getScrollRectangle();

        const viewportTop = scrollTop - scrollHeight * offscreenToViewportRatio!;
        const viewportBottom = scrollBottom + scrollHeight * offscreenToViewportRatio!;

        const { aboveSpace, belowSpace, endIndex, startIndex } = items.reduce((result, item, index) => {
            const key = getKey(item);
            const height = this.heights[key] ? this.heights[key] : assumeHeight;
            const currentBottom = result.currentTop + height;

            if (result.currentTop <= viewportBottom && currentBottom >= viewportTop) {
                if (result.startIndex === -1) {
                    result.startIndex = index;
                }

                result.endIndex = index + 1;
            } else {
                if (result.startIndex === -1) {
                    result.aboveSpace += height;
                } else {
                    result.belowSpace += height;
                }
            }

            result.currentTop = currentBottom;

            return result;
        }, {
            aboveSpace: 0,
            belowSpace: 0,
            endIndex: -1,
            startIndex: -1,
            currentTop: 0
        });

        this.setState({
            aboveSpace,
            belowSpace,
            startIndex,
            endIndex
        });
    }

    handleScroll(event: Event) {
        this.updateScrollPosition();
    }

    handleHeightChanged() {
        if (this.updateHeights()) {
            this.updateScrollPosition();
        }
    }

    renderItem(item: any): React.ReactElement<any> {
        const { getKey, renderItem } = this.props;

        const child = renderItem(item);
        const key = getKey(item);

        const ref = (element: React.ReactInstance) => {
            if (element) {
                this.elements[key] = findDOMNode<HTMLElement>(element);
            } else {
                delete this.elements[key];
            }
        };

        return cloneElement(child, {
            ref: createChainedFunction(ref, (child as any).ref)
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
