import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import throttle from 'lodash.throttle';
import { findDOMNode } from 'react-dom';

import getScrollableParent from 'utils/dom/getScrollableParent';

export default class AutoHidingHeader extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        pinned: PropTypes.bool,
        getScrollableParent: PropTypes.func,
        tolerance: PropTypes.number,
        scrollDebounceTime: PropTypes.number
    };

    static defaultProps = {
        getScrollableParent,
        pinned: true,
        scrollDebounceTime: 100,
        tolerance: 8
    };

    private lastScrollTop: number = null;

    private scrollable: any;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isPinned: props.pinned
        };

        this.handleScroll = throttle(this.handleScroll.bind(this), props.scrollDebounceTime);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
    }

    componentWillUpdate(nextProps: any, nextState: any) {
        if (this.props.pinned !== nextProps.pinned) {
            const { clientHeight } = findDOMNode(this);
            const scrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;

            this.setState(state => ({
                ...state,
                isPinned: nextProps.pinned && scrollTop < clientHeight
            }));

            this.lastScrollTop = null;
        }
    }

    handleScroll() {
        const { pinned, tolerance } = this.props;
        const { clientHeight } = findDOMNode(this);
        const scrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;

        if (pinned) {
            /// Ignore first scroll
            if (this.lastScrollTop !== null) {
                if (scrollTop < clientHeight) {
                    this.setState(state => ({
                        ...state,
                        isPinned: true
                    }));
                } else {
                    const scrollDistance = Math.abs(this.lastScrollTop - scrollTop);

                    if (scrollDistance > tolerance) {
                        this.setState(state => ({
                            ...state,
                            isPinned: this.lastScrollTop > scrollTop
                        }));
                    }
                }
            }

            this.lastScrollTop = scrollTop;
        }
    }

    render() {
        const { children, className, pinned } = this.props;
        const { isPinned } = this.state;

        const containerClassName = classnames(className, {
            'is-pinned': pinned && isPinned
        });

        return (
            <div className={containerClassName}>
                {children}
            </div>
        );
    }
}
