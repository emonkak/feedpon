import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import getScrollableParent from 'utils/dom/getScrollableParent';
import throttleEventHandler from 'utils/throttleEventHandler';

interface AutoHidingHeaderProps {
    children?: React.ReactNode;
    className?: string;
    getScrollableParent?: (element: Element) => Element;
    isDisabled?: boolean;
    isPinned?: boolean;
    scrollThrottleTime?: number;
    tolerance?: number;
}

interface AutoHidingHeaderState {
    isPinned: boolean;
}

export default class AutoHidingHeader extends PureComponent<AutoHidingHeaderProps, AutoHidingHeaderState> {
    static defaultProps = {
        getScrollableParent,
        isDisabled: false,
        isPinned: true,
        scrollThrottleTime: 100,
        tolerance: 4
    };

    private lastScrollTop: number | null = null;

    private containerElement: Element;

    private scrollable: Element | Window;

    constructor(props: AutoHidingHeaderProps, context: any) {
        super(props, context);

        this.state = {
            isPinned: props.isPinned!
        };

        this.handleScroll = throttleEventHandler(this.handleScroll.bind(this), props.scrollThrottleTime!);
    }

    componentDidMount() {
        this.containerElement = findDOMNode(this);

        this.scrollable = this.props.getScrollableParent!(this.containerElement);
        this.scrollable.addEventListener('scroll', this.handleScroll);
        this.scrollable.addEventListener('touchmove', this.handleScroll);
    }

    componentWillUpdate(nextProps: AutoHidingHeaderProps, nextState: {}) {
        if (this.props.isDisabled !== nextProps.isDisabled && nextProps.isDisabled) {
            this.setState({
                isPinned: nextProps.isPinned!
            });

            this.lastScrollTop = null;
        }
    }

    componentWillUnmount() {
        this.scrollable.removeEventListener('scroll', this.handleScroll);
        this.scrollable.removeEventListener('touchmove', this.handleScroll);
    }

    handleScroll(event: Event) {
        const { isDisabled } = this.props;

        if (isDisabled) {
            return;
        }

        const viewport = this.getViewportRect();

        /// Ignore first scroll
        if (this.lastScrollTop != null) {
            const { clientHeight } = this.containerElement;
            const scrollHeight = this.getScrollHeight();

            if ((viewport.top < clientHeight) || (viewport.bottom > scrollHeight - viewport.height)) {
                this.setState({
                    isPinned: true
                });
            } else {
                const scrollDistance = Math.abs(this.lastScrollTop - viewport.top);
                const { tolerance } = this.props;

                if (scrollDistance > tolerance!) {
                    this.setState({
                        isPinned: this.lastScrollTop > viewport.top
                    });
                }
            }
        }

        this.lastScrollTop = viewport.top;
    }

    getViewportRect() {
        let top = 0;
        let height = 0;

        if (this.scrollable instanceof Element) {
            top = this.scrollable.scrollTop;
            height = this.scrollable.clientHeight;
        } else if (this.scrollable instanceof Window) {
            top = this.scrollable.scrollY;
            height = this.scrollable.innerHeight;
        }

        return { top, height, bottom: top + height };
    }

    getScrollHeight() {
        let height = 0;

        if (this.scrollable instanceof Element) {
            height = this.scrollable.scrollHeight;
        } else if (this.scrollable instanceof Window) {
            height = this.scrollable.document.documentElement.scrollHeight;
        }

        return height;
    }

    render() {
        const { children, className, isDisabled } = this.props;
        const { isPinned } = this.state;

        const containerClassName = classnames(className, {
            'is-pinned': !isDisabled && isPinned
        });

        return (
            <div className={containerClassName}>
                {children}
            </div>
        );
    }
}
