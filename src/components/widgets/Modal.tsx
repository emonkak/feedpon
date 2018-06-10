import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent } from 'react';

interface ModalProps {
    children?: React.ReactNode;
    isOpened?: boolean;
    onClose?: () => void;
}

export default class Modal extends PureComponent<ModalProps> {
    static defaultProps = {
        isOpened: false
    };

    constructor(props: ModalProps) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
    }

    componentDidMount() {
        this.refreshBodyStyles(this.props.isOpened!);

        document.addEventListener('keydown', this.handleDocumentKeyDown, true);
    }

    componentDidUpdate(prevProps: ModalProps) {
        this.refreshBodyStyles(this.props.isOpened!);
    }

    componentWillUnmount() {
        this.refreshBodyStyles(false);

        document.removeEventListener('keydown', this.handleDocumentKeyDown, true);
    }

    handleClick(event: React.MouseEvent<any>) {
        if (event.target === event.currentTarget) {
            event.preventDefault();

            const { onClose } = this.props;

            if (onClose) {
                onClose();
            }
        }
    }

    handleDocumentKeyDown(event: KeyboardEvent) {
        const { isOpened } = this.props;

        if (isOpened) {
            event.stopPropagation();

            if (event.key === 'Escape') {
                const { onClose } = this.props;

                if (onClose) {
                    onClose();
                }
            }
        }
    }

    refreshBodyStyles(isOpened: boolean) {
        const numModals = document.getElementsByClassName('modal').length;

        if (numModals <= 1) {
            if (isOpened) {
                document.documentElement.classList.add('modal-is-opened');
            } else {
                document.documentElement.classList.remove('modal-is-opened');
            }
         }
    }

    renderModal() {
        const { children } = this.props;

        return (
            <div className="modal" onClick={this.handleClick}>
                <div className="modal-dialog">{children}</div>
            </div>
        );
    }

    render() {
        const { isOpened } = this.props;

        return (
            <CSSTransition
                classNames="modal"
                timeout={200}>
                <div>
                    {isOpened ? this.renderModal() : null}
                </div>
            </CSSTransition>
        );
    }
}
