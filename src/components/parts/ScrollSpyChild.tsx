import { Children, PropTypes, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

export default class ScrollSpyChild extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        keyForSpy: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired,
        registry: PropTypes.shape({
            register: PropTypes.func.isRequired,
            unregister: PropTypes.func.isRequired
        }).isRequired
    };

    componentDidMount() {
        this.props.registry.register(findDOMNode(this), this.props.keyForSpy);
    }

    componentWillUnmount() {
        this.props.registry.unregister(findDOMNode(this));
    }

    render() {
        return Children.only(this.props.children);
    }
}
