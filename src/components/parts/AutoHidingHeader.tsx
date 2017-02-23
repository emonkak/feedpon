import React, { PropTypes, PureComponent } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

export default class AutoHidingHeader extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        pinned: PropTypes.bool,
        pinnedClassName: PropTypes.string,
        scroller: PropTypes.instanceOf(Element),
        tolerance: PropTypes.number,
        unpinnedClassName: PropTypes.string,
    };

    static defaultProps = {
        pinned: true,
        pinnedClassName: 'is-pinned',
        tolerance: 8,
        unpinnedClassName: '',
    };

    private lastScrollTop: number = 0;

    private isTicking: boolean = false;

    private scroller: Element = null;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            pinned: props.pinned,
        };

        this.handleScroll = this.handleScroll.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    componentDidMount() {
        this.scroller = this.props.scroller || this.getScroller();

        this.scroller.addEventListener('scroll', this.handleScroll);

        this.lastScrollTop = this.scroller.scrollTop;
    }

    componentWillUnmount() {
        this.scroller.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        if (!this.isTicking) {
            window.requestAnimationFrame(this.handleUpdate);
            this.isTicking = true;
        }
    }

    handleUpdate() {
        const { tolerance } = this.props;
        const { clientHeight } = ReactDOM.findDOMNode(this);
        const scrollDistance = Math.abs(this.lastScrollTop - this.scroller.scrollTop);

        if (this.scroller.scrollTop <= clientHeight) {
            this.setState({
                pinned: true,
            });
        } else if (scrollDistance > tolerance) {
            this.setState({
                pinned: this.lastScrollTop > this.scroller.scrollTop,
            });
        }

        this.lastScrollTop = this.scroller.scrollTop;
        this.isTicking = false;
    }

    getScroller(): Element {
        let node = ReactDOM.findDOMNode(this);

        do {
            const style = getComputedStyle(node, null);
            const overflowY = style.getPropertyValue('overflow-y');

            if (overflowY === 'auto' || overflowY === 'scroll') {
                break;
            }
        } while (node.parentNode instanceof Element && (node = node.parentNode));

        return node;
    }

    render() {
        const { children, className, pinnedClassName, unpinnedClassName } = this.props;
        const { pinned } = this.state;

        const containerClassName = classnames(className, {
            [pinnedClassName]: pinned,
            [unpinnedClassName]: !pinned,
        });

        return (
            <div className={containerClassName}>
                {children}
            </div>
        );
    }
}
