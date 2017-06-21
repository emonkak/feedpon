import { Children, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

interface ClosableProps {
    children?: React.ReactElement<any>;
    isDisabled?: boolean;
    onClose?: () => void;
}

export default class Closable extends PureComponent<ClosableProps, {}> {
    static defaultProps = {
        isDisabled: false
    }

    constructor(props: ClosableProps, context: any) {
        super(props, context);

        this.handleMouseCapture = this.handleMouseCapture.bind(this);
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

    handleMouseCapture(event: MouseEvent) {
        const { onClose } = this.props;

        if (onClose) {
            const node = findDOMNode(this);

            if (!node.contains(event.target as Node)) {
                onClose();
            }
        }
    }

    registerDocumentListeners() {
        document.addEventListener('click', this.handleMouseCapture);
    }

    unregisterDocumentListeners() {
        document.removeEventListener('click', this.handleMouseCapture);
    }

    render() {
        return Children.only(this.props.children);
    }
}
