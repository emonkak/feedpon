import Enumerable from '@emonkak/enumerable';
import React, { Children, PropTypes, PureComponent } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

import '@emonkak/enumerable/extensions/firstOrDefault';
import '@emonkak/enumerable/extensions/maxBy';
import '@emonkak/enumerable/extensions/select';
import '@emonkak/enumerable/extensions/where';

const contextTypes = {
    scrollSpy: PropTypes.shape({
        register: PropTypes.func.isRequired,
        unregister: PropTypes.func.isRequired
    })
};

export default class ScrollSpy extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        getScrollable: PropTypes.func.isRequired,
        marginBottom: PropTypes.number,
        marginTop: PropTypes.number,
        onActivate: PropTypes.func,
        onDeactivate: PropTypes.func,
        renderActiveChild: PropTypes.func,
        renderInactiveChild: PropTypes.func,
        scrollDebounceTime: PropTypes.number
    };

    static childContextTypes = contextTypes;

    static defaultProps = {
        getScrollable: () => window,
        marginBottom: 0,
        marginTop: 0,
        renderActiveChild: child => child,
        renderInactiveChild: child => child,
        scrollDebounceTime: 100
    };

    private scrollable: any;

    public readonly childKeys: Map<HTMLElement, string> = new Map();

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            activeKey: null,
            inactiveKey: null
        };

        this.handleScroll = throttle(this.handleScroll.bind(this), props.scrollDebounceTime);
    }

    getChildContext() {
        const scrollSpy = {
            register: (element: HTMLElement, key: string) => {
                this.childKeys.set(element, key);
            },
            unregister: (element: HTMLElement) => {
                this.childKeys.delete(element);
            }
        };

        return { scrollSpy };
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollable(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        const activeKey = this.getActiveKey();
        const prevActiveKey = this.state.activeKey;

        if (activeKey !== prevActiveKey) {
            if (activeKey) {
                const { onActivate } = this.props;

                if (onActivate) {
                    onActivate(activeKey, prevActiveKey);
                }
            } else {
                const { onDeactivate } = this.props;

                if (onDeactivate) {
                    onDeactivate(prevActiveKey);
                }
            }

            this.setState(state => ({
                ...state,
                activeKey,
                inactiveKey: prevActiveKey
            }));
        }
    }

    getActiveKey(): string | null {
        const { marginBottom, marginTop } = this.props;
        const scrollTop = (this.scrollable.scrollY || this.scrollable.scrollTop || 0) + marginTop;
        const scrollBottom = scrollTop + (this.scrollable.innerHeight || this.scrollable.clientHeight || 0) - marginBottom;

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
            <ScrollSpyChild keyForSpy={child.key}>{child}</ScrollSpyChild>
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
        ]).isRequired
    };

    static contextTypes = contextTypes;

    componentDidMount() {
        this.context.scrollSpy.register(findDOMNode(this), this.props.keyForSpy);
    }

    componentWillUnmount() {
        this.context.scrollSpy.unregister(findDOMNode(this));
    }

    render() {
        return Children.only(this.props.children);
    }
}
