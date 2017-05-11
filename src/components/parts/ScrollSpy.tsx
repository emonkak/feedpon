import Enumerable from '@emonkak/enumerable';
import React, { Children, PureComponent, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

import createChainedFunction from 'utils/createChainedFunction';
import throttleEventHandler from 'utils/throttleEventHandler';

interface ScrollSpyProps {
    getScrollableParent?: (element: Element) => Element | Window;
    isDisabled?: boolean;
    marginBottom?: number;
    marginTop?: number;
    onActivate?: (key: React.Key) => void;
    onInactivate?: (key: React.Key) => void;
    renderChild: (child: React.ReactElement<any>, isActive: boolean) => React.ReactElement<any>;
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
        getScrollableParent: (element: Element) => window,
        isDisabled: false,
        marginBottom: 0,
        marginTop: 0,
        scrollThrottleTime: 100
    };

    private readonly childKeys: Map<React.Key, HTMLElement> = new Map();

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

    getScrollRect() {
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
        return new Enumerable(this.childKeys)
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
        const { top, height } = this.getScrollRect();

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

    renderChild(child: React.ReactElement<any>) {
        const childKey = child.key;

        if (childKey) {
            const { childKeys } = this;
            const { renderChild } = this.props;
            const { activeKey } = this.state;

            const ref = (child: React.ReactInstance) => {
                if (child) {
                    childKeys.set(childKey, findDOMNode<HTMLElement>(child));
                } else {
                    childKeys.delete(childKey);
                }
            };

            child = renderChild(child, childKey === activeKey);

            return cloneElement(child, {
                ...child.props,
                ref: createChainedFunction((child as any).ref, ref)
            });
        }

        return child;
    }

    render() {
        const { renderList, children } = this.props;

        return renderList(Children.map(children, this.renderChild.bind(this)));
    }
}
