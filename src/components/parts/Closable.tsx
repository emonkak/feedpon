import { PropTypes, PureComponent, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';

interface Props {
    children?: React.ReactElement<any>;
    isDisabled?: boolean;
    onClose?: () => void;
}

export default class Closable extends PureComponent<Props, {}> {
    static propTypes = {
        children: PropTypes.element.isRequired,
        isDisabled: PropTypes.bool.isRequired,
        onClose: PropTypes.func,
    };

    static defaultProps = {
        isDisabled: false,
    }

    private childElement: Element;

    constructor(props: Props, context: any) {
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
        const { isDisabled } = this.props;

        if (!isDisabled) {
            this.registerDocumentListeners();
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        const { isDisabled } = this.props;

        if (prevProps.isDisabled !== isDisabled) {
            if (isDisabled) {
                this.unregisterDocumentListeners();
            } else {
                this.registerDocumentListeners();
            }
        }
    }

    componentWillUnmount() {
        const { isDisabled } = this.props;

        if (!isDisabled) {
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
            ref: (element: Element) => { this.childElement = element },
        });
    }
}
