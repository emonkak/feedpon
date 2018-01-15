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
    };

    componentDidMount() {
        const { isDisabled } = this.props;

        if (!isDisabled) {
            this._registerDocumentListeners();
        }
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        const { isDisabled } = this.props;

        if (prevProps.isDisabled !== isDisabled) {
            if (isDisabled) {
                this._unregisterDocumentListeners();
            } else {
                this._registerDocumentListeners();
            }
        }
    }

    componentWillUnmount() {
        const { isDisabled } = this.props;

        if (!isDisabled) {
            this._unregisterDocumentListeners();
        }
    }

    render() {
        return Children.only(this.props.children);
    }

    private _registerDocumentListeners(): void {
        document.addEventListener('click', this._handleMouseCapture);
    }

    private _unregisterDocumentListeners(): void {
        document.removeEventListener('click', this._handleMouseCapture);
    }

    private _handleMouseCapture = (event: MouseEvent): void => {
        const { onClose } = this.props;

        if (onClose) {
            const target = event.target as HTMLElement;
            const container = findDOMNode(this) as HTMLElement;

            if (!container.contains(target) && target.offsetParent !== null) {
                onClose();
            }
        }
    };
}
