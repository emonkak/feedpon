import { Children, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

interface ClosableProps {
    children: React.ReactElement<any>;
    isDisabled?: boolean;
    onClose?: () => void;
}

export default class Closable extends PureComponent<ClosableProps> {
    static defaultProps = {
        isDisabled: false
    };

    componentDidMount() {
        this._registerEventListeners();
    }

    componentWillUnmount() {
        this._unregisterEventListeners();
    }

    render() {
        return Children.only(this.props.children);
    }

    private _registerEventListeners(): void {
        document.addEventListener('click', this._handleMouseCapture);
        window.addEventListener('resize', this._handleResize);
    }

    private _unregisterEventListeners(): void {
        document.removeEventListener('click', this._handleMouseCapture);
        window.removeEventListener('resize', this._handleResize);
    }

    private _handleMouseCapture = (event: MouseEvent): void => {
        const { isDisabled, onClose } = this.props;

        if (!isDisabled && onClose) {
            const target = event.target as HTMLElement;
            const container = findDOMNode(this) as HTMLElement;

            if (!container.contains(target) && target.offsetParent !== null) {
                onClose();
            }
        }
    }

    private _handleResize = (event: Event): void => {
        const { isDisabled, onClose } = this.props;

        if (!isDisabled && onClose) {
            onClose();
        }
    }
}
