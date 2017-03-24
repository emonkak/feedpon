import Enumerable from '@emonkak/enumerable';
import React, { Children, PropTypes, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

import getScrollableParent from 'utils/dom/getScrollableParent';
import throttleEventHandler from 'utils/throttleEventHandler';

const initialState = {
    activeKey: '',
    activeIndex: -1
};

export default class ScrollSpy extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        getScrollableParent: PropTypes.func.isRequired,
        isDisabled: PropTypes.bool.isRequired,
        marginBottom: PropTypes.number.isRequired,
        marginTop: PropTypes.number.isRequired,
        onActivate: PropTypes.func,
        onInactivate: PropTypes.func,
        renderActiveChild: PropTypes.func.isRequired,
        scrollThrottleTime: PropTypes.number.isRequired
    };

    static defaultProps = {
        isDisabled: false,
        getScrollableParent,
        marginBottom: 0,
        marginTop: 0,
        renderActiveChild: child => child,
        scrollThrottleTime: 100
    };

    private readonly registry = new ScrollSpyRegistry();

    private scrollable: any;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = initialState;

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent(findDOMNode(this));

        this.scrollable.addEventListener('scroll', this.handleScroll);
        this.scrollable.addEventListener('touchmove', this.handleScroll);

        this.update();
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
    }

    componentWillReceiveProps(nextProps: any) {
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

    update() {
        const { marginBottom, marginTop } = this.props;
        const scrollTop = (this.scrollable.scrollY || this.scrollable.scrollTop || 0) + marginTop;
        const scrollBottom = scrollTop + (this.scrollable.innerHeight || this.scrollable.clientHeight || 0) - marginBottom;
        const scrollHeight = (this.scrollable.document ? this.scrollable.document.documentElement : this.scrollable).scrollHeight || 0;

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
        const { renderActiveChild } = this.props;
        const { activeKey } = this.state;

        if (child.key === activeKey) {
            child = renderActiveChild(child);
        }

        return (
            <ScrollSpyChild
                index={index}
                keyForSpy={child.key}
                registry={this.registry}>
                {child}
            </ScrollSpyChild>
        );
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

class ScrollSpyChild extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        index: PropTypes.number.isRequired,
        keyForSpy: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired,
        registry: PropTypes.shape({
            register: PropTypes.func.isRequired,
            unregister: PropTypes.func.isRequired
        }).isRequired
    };

    componentDidMount() {
        this.props.registry.register(findDOMNode(this), this.props.keyForSpy, this.props.index);
    }

    componentWillUnmount() {
        this.props.registry.unregister(findDOMNode(this));
    }

    render() {
        return Children.only(this.props.children);
    }
}

type KeyAndIndex = { key: string, index: number };

class ScrollSpyRegistry {
    private readonly childKeys: Map<HTMLElement, KeyAndIndex> = new Map();

    register(element: HTMLElement, key: string, index: number): void {
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
