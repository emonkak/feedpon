import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import getScrollableParent from 'utils/dom/getScrollableParent';
import throttleEventHandler from 'utils/throttleEventHandler';

export default class AutoHidingHeader extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        pinned: PropTypes.bool,
        getScrollableParent: PropTypes.func,
        tolerance: PropTypes.number,
        scrollThrottleTime: PropTypes.number
    };

    static defaultProps = {
        getScrollableParent,
        pinned: true,
        scrollThrottleTime: 60,
        tolerance: 8
    };

    private lastScrollTop: number = null;

    private scrollable: any;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isPinned: props.pinned
        };

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime) as any;
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll);
        this.scrollable.addEventListener('touchmove', this.handleScroll);
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
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

        if (pinned) {
            const scrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;

            /// Ignore first scroll
            if (this.lastScrollTop !== null) {
                const scrollBottom = scrollTop + (this.scrollable.innerHeight || this.scrollable.clientHeight || 0);
                const scrollHeight = (this.scrollable.document ? this.scrollable.document.documentElement : this.scrollable).scrollHeight || 0;
                const { clientHeight } = findDOMNode(this);

                if (scrollTop < clientHeight || scrollBottom > scrollHeight - clientHeight) {
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
