import { PropTypes, PureComponent, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';

export default class Closable extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        disabled: PropTypes.bool,
        onClose: PropTypes.func,
    };

    static defaultProps = {
        disabled: false,
    }

    private childElement: Element;

    constructor(props: any, context: any) {
        super(props, context);

        this.handleMouseCapture = this.handleMouseCapture.bind(this);
    }

    handleMouseCapture(event: MouseEvent) {
        const { onClose } = this.props;

        if (onClose) {
            const childNode = findDOMNode(this.childElement);

            if (!childNode.contains(event.target as Node)) {
                onClose();
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

    render() {
        return cloneElement(this.props.children, {
            ref: (element) => { this.childElement = element },
        });
    }
}
