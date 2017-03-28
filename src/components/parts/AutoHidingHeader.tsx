import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import getScrollableParent from 'supports/dom/getScrollableParent';
import throttleEventHandler from 'supports/throttleEventHandler';

export default class AutoHidingHeader extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        className: PropTypes.string,
        getScrollableParent: PropTypes.func,
        isPinned: PropTypes.bool.isRequired,
        scrollThrottleTime: PropTypes.number.isRequired,
        tolerance: PropTypes.number.isRequired
    };

    static defaultProps = {
        getScrollableParent,
        isPinned: true,
        scrollThrottleTime: 100,
        tolerance: 4
    };

    private lastScrollTop: number = null;

    private scrollable: any;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isPinned: props.isPinned
        };

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime);
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

    componentWillReceiveProps(nextProps: any) {
        if (this.props.isPinned !== nextProps.isPinned) {
            const { clientHeight } = findDOMNode(this);
            const scrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;

            this.setState(state => ({
                ...state,
                isPinned: nextProps.isPinned && scrollTop < clientHeight
            }));

            this.lastScrollTop = null;
        }
    }

    handleScroll(event: Event) {
        const { isPinned } = this.props;

        if (isPinned) {
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
                    const { tolerance } = this.props;

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
        const { children, className, isPinned } = this.props;

        const containerClassName = classnames(className, {
            'is-pinned': isPinned && this.state.isPinned
        });

        return (
            <div className={containerClassName}>
                {children}
            </div>
        );
    }
}
