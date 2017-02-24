import React, { PropTypes, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';
import classnames from 'classnames';

import getScrollable from 'utils/dom/getScrollable';

export default class AutoHidingHeader extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        pinned: PropTypes.bool,
        scrollable: PropTypes.oneOfType([
            PropTypes.instanceOf(Element),
            PropTypes.instanceOf(Window)
        ]),
        tolerance: PropTypes.number
    };

    static defaultProps = {
        pinned: true,
        tolerance: 8
    };

    private lastScrollTop: number = 0;

    private isTicking: boolean = false;

    private scrollable: Element;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            pinned: props.pinned
        };

        this.handleScroll = this.handleScroll.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
        this.scrollable = this.props.scrollable || getScrollable(findDOMNode(this));

        this.scrollable.addEventListener('scroll', this.handleScroll);

        this.lastScrollTop = this.scrollable.scrollTop;
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        if (!this.isTicking) {
            window.requestAnimationFrame(this.handleUpdate);
            this.isTicking = true;
        }
    }

    handleUpdate() {
        const { tolerance } = this.props;
        const { clientHeight } = findDOMNode(this);
        const scrollDistance = Math.abs(this.lastScrollTop - this.scrollable.scrollTop);

        if (this.scrollable.scrollTop <= clientHeight) {
            this.setState({
                pinned: true,
            });
        } else if (scrollDistance > tolerance) {
            this.setState({
                pinned: this.lastScrollTop > this.scrollable.scrollTop,
            });
        }

        this.lastScrollTop = this.scrollable.scrollTop;
        this.isTicking = false;
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
