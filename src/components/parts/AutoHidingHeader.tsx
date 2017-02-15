import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as classnames from 'classnames';

export default class AutoHidingHeader extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.element,
        className: React.PropTypes.string,
        isPinned: React.PropTypes.bool,
        pinnedClassName: React.PropTypes.string,
        scroller: React.PropTypes.instanceOf(Element),
        tolerance: React.PropTypes.number,
        unpinnedClassName: React.PropTypes.string,
    };

    static defaultProps = {
        isPinned: true,
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
            isPinned: props.isPinned,
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
        const scrollDistance = Math.abs(this.lastScrollTop - window.scrollY);

        if (this.scroller.scrollTop <= clientHeight) {
            this.setState({
                isPinned: true,
            });
        } else if (scrollDistance > tolerance) {
            this.setState({
                isPinned: this.lastScrollTop > this.scroller.scrollTop,
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
        } while (node = node.parentNode as Element);

        return node;
    }

    render() {
        const { children, className, pinnedClassName, unpinnedClassName } = this.props;
        const { isPinned } = this.state;

        const containerClassName = classnames(className, {
            [pinnedClassName]: isPinned,
            [unpinnedClassName]: !isPinned,
        });

        return (
            <div className={containerClassName}>
                {children}
            </div>
        );
    }
}
