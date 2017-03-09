import React, { Children, PropTypes, PureComponent } from 'react';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

import getScrollableParent from 'utils/dom/getScrollableParent';
import ScrollSpyRegistry from 'components/parts/ScrollSpyRegistry';
import ScrollSpyChild from 'components/parts/ScrollSpyChild';

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
