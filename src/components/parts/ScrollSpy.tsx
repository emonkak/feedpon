import Enumerable from '@emonkak/enumerable';
import React, { Children, PureComponent, cloneElement, isValidElement } from 'react';
import { findDOMNode } from 'react-dom';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

import createChainedFunction from 'utils/createChainedFunction';
import getScrollableParent from 'utils/dom/getScrollableParent';
import throttleEventHandler from 'utils/throttleEventHandler';

interface ScrollSpyProps {
    getScrollableParent?: (element: Element) => Element | Window;
    isDisabled?: boolean;
    marginBottom?: number;
    marginTop?: number;
    onUpdate: (index: number) => void;
    renderList: (children: React.ReactNode) => React.ReactElement<any>;
    scrollThrottleTime?: number;
}

export default class ScrollSpy extends PureComponent<ScrollSpyProps, {}> {
    static defaultProps = {
        getScrollableParent,
        isDisabled: false,
        marginBottom: 0,
        marginTop: 0,
        scrollThrottleTime: 100
    };

    readonly childElements: Map<number, HTMLElement> = new Map();

    scrollable: Element | Window;

    constructor(props: ScrollSpyProps, context: any) {
        super(props, context);

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime!);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent!(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll, { passive: true } as any);
        this.scrollable.addEventListener('touchmove', this.handleScroll, { passive: true } as any);

        this.update();
    }

    componentDidUpdate(prevProps: ScrollSpyProps, prevState: {}) {
        if (!this.props.isDisabled) {
            this.update();
        }
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
    }

    getViewportRect() {
        let top = 0;
        let height = 0;

        if (this.scrollable instanceof Element) {
            top = this.scrollable.scrollTop;
            height = this.scrollable.clientHeight;
        } else if (this.scrollable instanceof Window) {
            top = this.scrollable.scrollY;
            height = this.scrollable.innerHeight;
        }

        return { top, height };
    }

    getActiveIndex(scrollTop: number, scrollBottom: number): number {
        const defaultIndex = this.childElements.has(0) && this.childElements.get(0)!.offsetTop >= scrollBottom
            ? -1
            : this.childElements.size;

        return new Enumerable(this.childElements)
            .where(([index, element]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                return offsetTop < scrollBottom && offsetBottom > scrollTop;
            })
            .maxBy(([index, element]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                if (offsetTop >= scrollTop && offsetBottom <= scrollBottom) {
                    return scrollBottom - offsetTop;
                } else {
                    const displayTop = Math.max(offsetTop, scrollTop);
                    const displayBottom = Math.min(offsetBottom, scrollBottom);

                    return displayBottom - displayTop;
                }
            })
            .select(([index]) => index)
            .firstOrDefault(null, defaultIndex);
    }

    update() {
        const { marginBottom, marginTop, onUpdate } = this.props;
        const { top, height } = this.getViewportRect();

        const scrollTop = top + (marginTop || 0);
        const scrollBottom = top + height - (marginBottom || 0);
        const activeIndex = this.getActiveIndex(scrollTop, scrollBottom);

        onUpdate(activeIndex);
    }

    handleScroll(event: Event) {
        const { isDisabled } = this.props;

        if (!isDisabled) {
            this.update();
        }
    }

    renderChild(child: React.ReactChild, index: number) {
        if (!isValidElement<any>(child)) {
            return child;
        }

        const ref = (instance: React.ReactInstance) => {
            if (child) {
                const element = findDOMNode<HTMLElement>(instance);

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
