import Enumerable from '@emonkak/enumerable';
import React, { Children, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

import throttleEventHandler from 'utils/throttleEventHandler';

interface ScrollSpyProps {
    className?: string;
    getScrollableParent: (element: Element) => Element | Window;
    isDisabled?: boolean;
    marginBottom?: number;
    marginTop?: number;
    onActivate?: (key: string | number, index: number) => void;
    onInactivate?: (key: string | number, index: number) => void;
    renderActiveChild: (child: React.ReactElement<any>) => React.ReactElement<any>;
    scrollThrottleTime?: number;
}

interface ScrollSpyState {
    activeKey: string | number;
    activeIndex: number;
}

const initialState: ScrollSpyState = {
    activeKey: '',
    activeIndex: -1
};

export default class ScrollSpy extends PureComponent<ScrollSpyProps, ScrollSpyState> {
    static defaultProps = {
        isDisabled: false,
        marginBottom: 0,
        marginTop: 0,
        renderActiveChild: (child: React.ReactElement<any>) => child,
        scrollThrottleTime: 100
    };

    private readonly registry = new ScrollSpyRegistry();

    private scrollable: Element | Window | null = null;

    constructor(props: ScrollSpyProps, context: any) {
        super(props, context);

        this.state = initialState;

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime!);
    }

    componentDidMount() {
        const scrollable = this.props.getScrollableParent(findDOMNode(this));

        scrollable.addEventListener('scroll', this.handleScroll);
        scrollable.addEventListener('touchmove', this.handleScroll);

        this.scrollable = scrollable;

        this.update();
    }

    componentWillUnmount() {
        if (this.scrollable) {
            this.scrollable.removeEventListener('scroll', this.handleScroll);
            this.scrollable.removeEventListener('touchmove', this.handleScroll);
        }
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

    handleScroll(event: Event) {
        const { isDisabled } = this.props;

        if (!isDisabled) {
            this.update();
        }
    }

    getScrollState() {
        let scrollTop = 0;
        let scrollBottom = 0;
        let scrollHeight = 0;

        if (this.scrollable instanceof Element) {
            scrollTop = this.scrollable.scrollTop;
            scrollBottom = scrollTop + this.scrollable.clientHeight;
            scrollHeight = this.scrollable.scrollHeight;
        } else if (this.scrollable instanceof Window) {
            scrollTop = this.scrollable.scrollY;
            scrollBottom = scrollTop + this.scrollable.innerHeight;
            scrollHeight = this.scrollable.document.documentElement.scrollHeight;
        }

        const { marginBottom, marginTop } = this.props;

        scrollTop += marginTop || 0;
        scrollBottom -= marginBottom || 0;

        return { scrollTop, scrollBottom, scrollHeight };
    }

    update() {
        const { scrollTop, scrollBottom, scrollHeight } = this.getScrollState();

        const { key: activeKey, index: activeIndex } = this.registry.getActiveKeyAndIndex(scrollTop, scrollBottom, scrollHeight);
        const { activeKey: prevActiveKey, activeIndex: prevActiveIndex } = this.state;

        if (prevActiveKey !== activeKey) {
            if (activeKey) {
                const { onActivate, onInactivate } = this.props;

                if (prevActiveKey !== '' && onInactivate) {
                    onInactivate(prevActiveKey, prevActiveIndex);
                }

                if (onActivate) {
                    onActivate(activeKey, activeIndex);
                }
            } else {
                const { onInactivate } = this.props;

                if (onInactivate) {
                    onInactivate(prevActiveKey, prevActiveIndex);
                }
            }

            this.setState(state => ({
                ...state,
                activeKey,
                activeIndex
            }));
        }
    }

    renderChild(child: React.ReactElement<any>, index: number) {
        const childKey = child.key;

        if (childKey) {
            const { renderActiveChild } = this.props;
            const { activeKey } = this.state;

            if (childKey === activeKey) {
                child = renderActiveChild(child);
            }

            return (
                <ScrollSpyChild
                    index={index}
                    registry={this.registry}
                    spyKey={childKey}>
                    {child}
                </ScrollSpyChild>
            );
        }

        return child;
    }

    render() {
        const { className, children } = this.props;

        return (
            <div className={className}>
                {Children.map(children, this.renderChild.bind(this))}
            </div>
        );
    }
}

interface ScrollSpyChildProps {
    index: number;
    spyKey: string | number;
    registry: ScrollSpyRegistry;
}

class ScrollSpyChild extends PureComponent<ScrollSpyChildProps, {}> {
    componentDidMount() {
        const element = findDOMNode(this) as HTMLElement;

        this.props.registry.register(element, this.props.spyKey, this.props.index);
    }

    componentWillUnmount() {
        const element = findDOMNode(this) as HTMLElement;

        this.props.registry.unregister(element);
    }

    render() {
        return Children.only(this.props.children);
    }
}

type KeyAndIndex = { key: string | number, index: number };

class ScrollSpyRegistry {
    private readonly childKeys: Map<HTMLElement, KeyAndIndex> = new Map();

    register(element: HTMLElement, key: string | number, index: number): void {
        this.childKeys.set(element, { key, index });
    }

    unregister(element: HTMLElement): void {
        this.childKeys.delete(element);
    }

    getActiveKeyAndIndex(scrollTop: number, scrollBottom: number, scrollHeight: number): KeyAndIndex {
        const defaultResult = { key: '', index: -1 };

        if (scrollBottom === scrollHeight) {
            return defaultResult;
        }

        return new Enumerable(this.childKeys)
            .where(([element]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                return offsetTop < scrollBottom && offsetBottom > scrollTop;
            })
            .maxBy(([element]) => {
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
            .select(([element, keyAndIndex]) => keyAndIndex)
            .firstOrDefault(null, defaultResult);
    }
}
