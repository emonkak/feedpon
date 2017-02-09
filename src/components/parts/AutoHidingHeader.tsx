import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as classnames from 'classnames';

export default class AutoHidingHeader extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.element.isRequired,
        isPinned: React.PropTypes.bool,
        pinnedClassName: React.PropTypes.string,
        tolerance: React.PropTypes.number,
        unpinnedClassName: React.PropTypes.string,
    };

    static defaultProps = {
        isPinned: true,
        pinnedClassName: 'is-pinned',
        tolerance: 8,
        unpinnedClassName: '',
    };

    private lastScrollY: number = 0;

    private isTicking: boolean = false;

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isPinned: props.isPinned,
        };

        this.handleScroll = this.handleScroll.bind(this);
        this.update = this.update.bind(this);
    }

    componentDidMount() {
        document.addEventListener('scroll', this.handleScroll);

        this.lastScrollY = window.scrollY;
    }

    componentWillUnmount() {
        document.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll() {
        if (!this.isTicking) {
            window.requestAnimationFrame(this.update);
            this.isTicking = true;
        }
    }

    update() {
        const { tolerance } = this.props;
        const { clientHeight } = ReactDOM.findDOMNode(this);
        const scrollDistance = Math.abs(this.lastScrollY - window.scrollY);

        if (window.scrollY <= clientHeight) {
            this.setState({
                isPinned: true,
            });
        } else if (scrollDistance > tolerance) {
            this.setState({
                isPinned: this.lastScrollY > window.scrollY,
            });
        }

        this.lastScrollY = window.scrollY;
        this.isTicking = false;
    }

    render() {
        const { children, pinnedClassName, unpinnedClassName } = this.props;
        const { isPinned } = this.state;

        return React.cloneElement(children, {
            ...children.props,
            className: classnames(children.props.className, {
                [pinnedClassName]: isPinned,
                [unpinnedClassName]: !isPinned,
            })
        });
    }
}
