import React, { Children, PropTypes, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

export default class Waypoint extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        disabled: PropTypes.bool,
        onEnter: PropTypes.func,
        onLeave: PropTypes.func,
        root: PropTypes.instanceOf(Element),
        rootMargin: PropTypes.string,
        threshold: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.number),
            PropTypes.number
        ]),
    };

    static defaultProps = {
        onEnter: () => {},
        onLeave: () => {},
    };

    private observer: IntersectionObserver;

    constructor(props: any, context: any) {
        super(props, context);

        this.observer = new IntersectionObserver(
            this.handleChanges.bind(this),
            this.getOptions(props)
        );
    }

    componentWillUnmount() {
        this.observer.disconnect();
    }

    handleChanges(changes: IntersectionObserverEntry[]) {
        const { disabled } = this.props;

        if (!disabled) {
            const { onEnter, onLeave } = this.props;

            for (const change of changes) {
                if (change.intersectionRatio > 0) {
                    onEnter(change);
                } else {
                    onLeave(change);
                }
            }
        }
    }

    getOptions(props: any) {
        const options: IntersectionObserverInit = {};

        if (props.root != null) {
            options.root = props.root;
        }

        if (props.rootMargin != null) {
            options.rootMargin = props.rootMargin;
        }

        if (props.threshold != null) {
            options.threshold = props.threshold;
        }

        return options;
    }

    render() {
        const { children } = this.props;

        return <WaypointChild observer={this.observer}>{children}</WaypointChild>
    }
}

class WaypointChild extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        observer: PropTypes.instanceOf(IntersectionObserver)
    };

    componentDidMount() {
        const node = findDOMNode(this);

        this.props.observer.observe(node);
    }

    componentWillUnmount() {
        const node = findDOMNode(this);

        this.props.observer.unobserve(node);
    }

    render() {
        return Children.only(this.props.children);
    }
}
