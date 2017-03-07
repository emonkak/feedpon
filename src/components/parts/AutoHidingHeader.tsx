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

    private lastScrollTop: number = 0;

    private scrollable: any;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            pinned: props.pinned
        };

        this.handleScroll = throttle(this.handleScroll.bind(this), props.scrollDebounceTime);
    }

    componentDidMount() {
        this.scrollable = this.props.getScrollableParent(findDOMNode(this));
        this.scrollable.addEventListener('scroll', this.handleScroll);

        this.lastScrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        const { tolerance } = this.props;
        const { clientHeight } = findDOMNode(this);
        const scrollTop = this.scrollable.scrollY || this.scrollable.scrollTop || 0;

        if (scrollTop < clientHeight) {
            this.setState({
                pinned: true,
            });
        } else {
            const scrollDistance = Math.abs(this.lastScrollTop - scrollTop);

            if (scrollDistance > tolerance) {
                this.setState({
                    pinned: this.lastScrollTop > scrollTop,
                });
            }
        }

        this.lastScrollTop = scrollTop;
    }

    render() {
        const { children, className } = this.props;
        const { pinned } = this.state;

        const containerClassName = classnames(className, {
            'is-pinned': pinned
        });

        return (
            <div className={containerClassName}>
                {children}
            </div>
        );
    }
}
