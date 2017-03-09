import React, { Children, PropTypes, PureComponent } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';
import Enumerable from '@emonkak/enumerable';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

import getScrollableParent from 'utils/dom/getScrollableParent';

export default class ScrollSpy extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        getScrollableParent: PropTypes.func.isRequired,
        marginBottom: PropTypes.number,
        marginTop: PropTypes.number,
        onActivate: PropTypes.func,
        onInactivate: PropTypes.func,
        renderActiveChild: PropTypes.func,
        renderInactiveChild: PropTypes.func,
        scrollDebounceTime: PropTypes.number
    };

    static defaultProps = {
        getScrollableParent,
        marginBottom: 0,
        marginTop: 0,
        renderActiveChild: child => child,
        renderInactiveChild: child => child,
        scrollDebounceTime: 100
    };

    private readonly registry = new ScrollSpyRegistry();

    private scrollable: any;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            activeKey: null,
            inactiveKey: null
        };

        this.handleScroll = throttle(this.handleScroll.bind(this), props.scrollDebounceTime);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll);

        this.handleScroll();
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        const { marginBottom, marginTop } = this.props;
        const scrollTop = (this.scrollable.scrollY || this.scrollable.scrollTop || 0) + marginTop;
        const scrollBottom = scrollTop + (this.scrollable.innerHeight || this.scrollable.clientHeight || 0) - marginBottom;

        const activeKey = this.registry.getActiveKey(scrollTop, scrollBottom);
        const prevActiveKey = this.state.activeKey;

        if (prevActiveKey !== activeKey) {
            if (activeKey) {
                const { onActivate } = this.props;

                if (onActivate) {
                    onActivate(activeKey, prevActiveKey);
                }
            } else {
                const { onInactivate } = this.props;

                if (onInactivate) {
                    onInactivate(prevActiveKey);
                }
            }

            this.setState(state => ({
                ...state,
                activeKey,
                inactiveKey: prevActiveKey
            }));
        }
    }

    renderChild(child: React.ReactElement<any>) {
        const { renderActiveChild, renderInactiveChild } = this.props;
        const { activeKey, inactiveKey } = this.state;

        if (child.key === activeKey) {
            child = renderActiveChild(child);
        }

        if (child.key === inactiveKey) {
            child = renderInactiveChild(child);
        }

        return (
            <ScrollSpyChild
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
        this.props.registry.register(findDOMNode(this), this.props.keyForSpy);
    }

    componentWillUnmount() {
        this.props.registry.unregister(findDOMNode(this));
    }

    render() {
        return Children.only(this.props.children);
    }
}

class ScrollSpyRegistry {
    private readonly childKeys: Map<HTMLElement, string> = new Map();

    register(element: HTMLElement, key: string): void {
        this.childKeys.set(element, key);
    }

    unregister(element: HTMLElement): void {
        this.childKeys.delete(element);
    }

    getActiveKey(scrollTop: number, scrollBottom: number): string {
        return new Enumerable(this.childKeys)
            .where(([element, key]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                return offsetTop < scrollBottom && offsetBottom > scrollTop;
            })
            .maxBy(([element, key]) => {
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
            .select(([element, key]) => key)
            .firstOrDefault();
    }
}
