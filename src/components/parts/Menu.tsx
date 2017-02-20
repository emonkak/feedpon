import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as classnames from 'classnames';

import createChainedFunction from 'utils/createChainedFunction';

export default class Menu extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        disabled: React.PropTypes.bool,
        onCancel: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        pullRight: React.PropTypes.bool,
    };

    static defaultProps = {
        disabled: true,
    }

    constructor(props: any, context: any) {
        super(props, context);

        this.handleMouseCapture = this.handleMouseCapture.bind(this);
    }

    handleMouseCapture(event: MouseEvent) {
        const { onCancel } = this.props;

        if (onCancel) {
            const container = ReactDOM.findDOMNode(this);

            if (!container.contains(event.target as Node)) {
                onCancel();
            }
        }
    }

    componentDidMount() {
        const { disabled } = this.props;

        if (!disabled) {
            this.registerDocumentListeners();
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        const { disabled } = this.props;

        if (prevProps.disabled !== disabled) {
            if (disabled) {
                this.unregisterDocumentListeners();
            } else {
                this.registerDocumentListeners();
            }
        }
    }

    componentWillUnmount() {
        const { disabled } = this.props;

        if (!disabled) {
            this.unregisterDocumentListeners();
        }
    }

    registerDocumentListeners() {
        document.addEventListener('click', this.handleMouseCapture);
    }

    unregisterDocumentListeners() {
        document.removeEventListener('click', this.handleMouseCapture);
    }

    renderChild(child: React.ReactElement<any>) {
        const { onSelect } = this.props;
        const childKey = child.key;

        return React.cloneElement(child, {
            ...child.props,
            onSelect: createChainedFunction(
                child.props.onSelect,
                event => onSelect(event, childKey)
            ),
        });
    }

    render() {
        const { children, pullRight } = this.props;

        return (
            <ul className={classnames('menu', {
                'menu-right': pullRight,
            })}>
                {React.Children.map(children, this.renderChild.bind(this))}
            </ul>
        );
    }
}
