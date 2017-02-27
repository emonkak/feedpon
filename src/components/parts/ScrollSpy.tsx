import Enumerable from '@emonkak/enumerable';
import React, { Children, PropTypes, PureComponent } from 'react';
import debounce from 'lodash.debounce';
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
        onActivate: PropTypes.func,
        onDeactivate: PropTypes.func,
        renderActiveChild: PropTypes.func.isRequired,
        scrollDebounceTime: PropTypes.number
    };

    static childContextTypes = contextTypes;

    static defaultProps = {
        scrollDebounceTime: 100
    };

    private scrollable: any;

    public readonly childElements: Map<string, HTMLElement> = new Map();

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            activeKey: null,
        };

        this.handleScroll = debounce(this.handleScroll.bind(this), props.scrollDebounceTime);
    }

    getChildContext() {
        const scrollSpy = {
            register: (key: string, element: HTMLElement) => {
                this.childElements.set(key, element);
            },
            unregister: (key: string) => {
                this.childElements.delete(key);
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
        const nextActiveKey = this.getActiveKey();
        const prevActiveKey = this.state.activeKey;

        if (nextActiveKey !== prevActiveKey) {
            if (nextActiveKey) {
                const { onActivate } = this.props;

                if (onActivate) {
                    onActivate(nextActiveKey, prevActiveKey);
                }
            } else {
                const { onDeactivate } = this.props;

                if (onDeactivate) {
                    onDeactivate(prevActiveKey);
                }
            }
        }

        this.setState(state => ({
            ...state,
            activeKey: nextActiveKey
        }));
    }

    getActiveKey(): string | null {
        const scrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;
        const scrollBottom = scrollTop + (this.scrollable.innerHeight || this.scrollable.clientHeight || 0);

        return new Enumerable(this.childElements)
            .where(([key, element]) => {
                const offsetTop = element.offsetTop;
                const offsetBottom = offsetTop + element.offsetHeight;

                return offsetTop < scrollBottom && offsetBottom > scrollTop;
            })
            .maxBy(([key, element]) => {
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
            .select(([key, element]) => key)
            .firstOrDefault();
    }

    renderChild(child: React.ReactElement<any>) {
        const { renderActiveChild } = this.props;
        const { activeKey } = this.state;

        if (child.key === activeKey) {
            child = renderActiveChild(child);
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
        this.context.scrollSpy.register(this.props.keyForSpy, findDOMNode(this));
    }

    componentWillUnmount() {
        this.context.scrollSpy.unregister(this.props.keyForSpy);
    }

    render() {
        return Children.only(this.props.children);
    }
}
