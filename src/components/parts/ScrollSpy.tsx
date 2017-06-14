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
    activeProp?: string;
    getKey: (child: React.ReactElement<any>) => React.Key;
    getScrollableParent?: (element: Element) => Element | Window;
    isDisabled?: boolean;
    marginBottom?: number;
    marginTop?: number;
    onActivate?: (key: React.Key) => void;
    onInactivate?: (key: React.Key) => void;
    renderList: (children: React.ReactNode) => React.ReactElement<any>;
    scrollThrottleTime?: number;
    style?: React.CSSProperties;
}

interface ScrollSpyState {
    activeKey: React.Key | null;
}

const initialState: ScrollSpyState = {
    activeKey: null
};

export default class ScrollSpy extends PureComponent<ScrollSpyProps, ScrollSpyState> {
    static defaultProps = {
        activeProp: 'isActive',
        getScrollableParent,
        isDisabled: false,
        marginBottom: 0,
        marginTop: 0,
        scrollThrottleTime: 100
    };

    private readonly childElements: Map<React.Key, HTMLElement> = new Map();

    private scrollable: Element | Window;

    constructor(props: ScrollSpyProps, context: any) {
        super(props, context);

        this.state = initialState;

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime!);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent!(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll, { passive: true } as any);
        this.scrollable.addEventListener('touchmove', this.handleScroll, { passive: true } as any);

        this.update();
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
    }

    componentWillReceiveProps(nextProps: ScrollSpyProps) {
        if (this.props.isDisabled !== nextProps.isDisabled) {
            if (nextProps.isDisabled) {
                this.setState(initialState);
            } else {
                this.update();
            }
        }
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

    getActiveKey(scrollTop: number, scrollBottom: number): React.Key | null {
        return new Enumerable(this.childElements)
            .where(([_key, element]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                return offsetTop < scrollBottom && offsetBottom > scrollTop;
            })
            .maxBy(([_key, element]) => {
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
            .select<React.Key | null>(([key]) => key)
            .firstOrDefault();
    }

    update() {
        const { marginBottom, marginTop } = this.props;
        const { top, height } = this.getViewportRect();

        const nextActiveKey = this.getActiveKey(
            top + (marginTop || 0),
            top + height - (marginBottom || 0)
        );
        const { activeKey } = this.state;

        if (activeKey !== nextActiveKey) {
            if (nextActiveKey) {
                const { onActivate, onInactivate } = this.props;

                if (activeKey != null && onInactivate) {
                    onInactivate(activeKey);
                }

                if (onActivate) {
                    onActivate(nextActiveKey);
                }
            } else {
                const { onInactivate } = this.props;

                if (activeKey != null && onInactivate) {
                    onInactivate(activeKey);
                }
            }

            this.setState(state => ({
                ...state,
                activeKey: nextActiveKey
            }));
        }
    }

    handleScroll(event: Event) {
        const { isDisabled } = this.props;

        if (!isDisabled) {
            this.update();
        }
    }

    renderChild(child: React.ReactChild) {
        if (!isValidElement<any>(child)) {
            return child;
        }

        const { getKey, activeProp } = this.props;
        const { activeKey } = this.state;

        const key = getKey(child);
        const ref = (instance: React.ReactInstance) => {
            if (child) {
                this.childElements.set(key, findDOMNode<HTMLElement>(instance));
            } else {
                this.childElements.delete(key);
            }
        };

        return cloneElement(child, {
            ...child.props,
            [activeProp!]: key === activeKey,
            ref: createChainedFunction((child as any).ref, ref)
        });
    }

    render() {
        const { renderList, children } = this.props;

        return renderList(Children.toArray(children).map(this.renderChild.bind(this)));
    }
}
