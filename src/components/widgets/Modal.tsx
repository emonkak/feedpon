import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PureComponent } from 'react';

interface ModalProps {
    children?: React.ReactNode;
    isOpened?: boolean;
    onClose?: () => void;
}

export default class Modal extends PureComponent<ModalProps, {}> {
    static defaultProps = {
        isOpened: false
    };

    constructor(props: ModalProps, context: any) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
    }

    componentDidMount() {
        this.refreshBodyStyles(this.props.isOpened!);

        document.addEventListener('keydown', this.handleDocumentKeyDown, true);
    }

    componentDidUpdate(prevProps: any, prevState: any) {
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

        if (numModals === 1) {
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
            <CSSTransitionGroup
                component="div"
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}
                transitionName="modal">
                {isOpened ? this.renderModal() : null}
            </CSSTransitionGroup>
        );
    }
}
