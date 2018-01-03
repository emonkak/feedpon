import Enumerable from '@emonkak/enumerable';
import React, { Children, PureComponent, cloneElement, isValidElement } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import createChainedFunction from 'utils/createChainedFunction';
import getScrollableParent from 'utils/dom/getScrollableParent';

interface ScrollSpyProps {
    getScrollableParent?: (element: Element) => Element | Window;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    marginTop?: number;
    onUpdateActiveIndex: (index: number) => void;
    renderList: (children: React.ReactNode) => React.ReactElement<any>;
    scrollThrottleTime?: number;
}

interface Rect {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export default class ScrollSpy extends PureComponent<ScrollSpyProps, {}> {
    static defaultProps = {
        getScrollableParent,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        scrollThrottleTime: 100
    };

    private readonly childElements: Map<number, HTMLElement> = new Map();

    private scrollable: Element | Window | null = null;

    constructor(props: ScrollSpyProps, context: any) {
        super(props, context);

        this.handleScroll = throttle(this.handleScroll.bind(this), props.scrollThrottleTime!);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent!(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll, { passive: true } as any);

        this.updateActiveIndex();
    }

    componentWillUnmount() {
        if (this.scrollable) {
            this.scrollable.removeEventListener('scroll', this.handleScroll, { passive: true } as any);
            this.scrollable = null;
        }
    }

    getScrollRect(): Rect {
        let left = 0;
        let right = 0;
        let top = 0;
        let bottom = 0;

        if (this.scrollable instanceof Element) {
            left = this.scrollable.scrollLeft;
            right = left + this.scrollable.clientWidth;
            top = this.scrollable.scrollTop;
            bottom = top + this.scrollable.clientHeight;
        } else if (this.scrollable instanceof Window) {
            left = this.scrollable.scrollX;
            right = left + this.scrollable.innerWidth;
            top = this.scrollable.scrollY;
            bottom = top + this.scrollable.innerHeight;
        }

        const { marginLeft, marginRight, marginTop, marginBottom } = this.props;
        left += marginLeft!;
        right += marginRight!;
        top += marginTop!;
        bottom += marginBottom!;

        return {
            left,
            right,
            top,
            bottom
        };
    }

    getActiveIndex(scroll: Rect): number {
        const childOffsets = new Enumerable(this.childElements)
            .select(([index, element]) => ({
                index,
                offset: getOffsetRect(element)
            }))
            .toArray();

        const activeIndex = new Enumerable(childOffsets)
            .where(({ offset }) =>
                offset.left < scroll.right &&
                    offset.right > scroll.left &&
                    offset.top < scroll.bottom &&
                    offset.bottom > scroll.top
            )
            .maxBy(({ offset }) => {
                if (offset.left >= scroll.left &&
                    offset.right <= scroll.right &&
                    offset.top >= scroll.top &&
                    offset.bottom <= scroll.bottom) {
                    return (scroll.right - offset.left) * (scroll.bottom - offset.top);
                } else {
                    return (Math.min(offset.right, scroll.right) - Math.max(offset.left, scroll.left)) *
                        (Math.min(offset.bottom, scroll.bottom) - Math.max(offset.top, scroll.top));
                }
            })
            .select(({ index }) => index)
            .firstOrDefault(null, -1);

        if (activeIndex >= 0) {
            return activeIndex;
        }

        const isReachedIndex = new Enumerable(childOffsets)
            .maxBy(({ offset }) => offset.left + offset.top)
            .select(({ offset }) => offset.left <= scroll.left && offset.top <= scroll.top)
            .firstOrDefault(null, false);

        return isReachedIndex ? this.childElements.size : -1;
    }

    updateActiveIndex(): void {
        const { onUpdateActiveIndex } = this.props;
        const scrollRect = this.getScrollRect();
        const activeIndex = this.getActiveIndex(scrollRect);

        onUpdateActiveIndex(activeIndex);
    }

    handleScroll(event: Event): void {
        if (!this.scrollable) {
            return;
        }

        this.updateActiveIndex();
    }

    renderChild(child: React.ReactChild, index: number) {
        if (!isValidElement<any>(child)) {
            return child;
        }

        const ref = (instance: React.ReactInstance | null) => {
            if (instance) {
                const element = findDOMNode(instance) as HTMLElement;

                if (element) {
                    this.childElements.set(index, element);
                }
            } else {
                this.childElements.delete(index);
            }
        };

        return cloneElement(child, {
            ...child.props,
            ref: createChainedFunction((child as any).ref, ref)
        });
    }

    render() {
        const { renderList, children } = this.props;

        return renderList(Children.map(children, this.renderChild.bind(this)));
    }
}

function getOffsetRect(element: HTMLElement): Rect {
    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = element;
    return {
        top: offsetTop,
        bottom: offsetTop + offsetHeight,
        left: offsetLeft,
        right: offsetLeft + offsetWidth
    };
}
