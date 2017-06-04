import React, { PureComponent } from 'react';

import Modal from 'components/parts/Modal';

interface ConfirmButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    cancelButtonClassName?: string;
    cancelButtonLabel?: string;
    modalMessage: string;
    modalTitle: string;
    okButtonClassName?: string;
    okButtonLabel?: string;
    onConfirm: () => void;
}

interface ConfirmButtonState {
    isConfirming: boolean;
}

export default class ConfirmButton extends PureComponent<ConfirmButtonProps, ConfirmButtonState> {
    static defaultProps = {
        cancelButtonClassName: 'button button-outline-default',
        cancelButtonLabel: 'Cancel',
        okButtonClassName: 'button button-positive-outline',
        okButtonLabel: 'OK'
    };

    constructor(props: ConfirmButtonProps, context: any) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.state = {
            isConfirming: false
        };
    }

    handleClose() {
        this.setState({
            isConfirming: false
        });
    }

    handleConfirm() {
        const { onConfirm } = this.props;

        onConfirm();

        this.setState({
            isConfirming: false
        });
    }

    handleOpen() {
        this.setState({
            isConfirming: true
        });
    }

    render() {
        const {
            cancelButtonClassName,
            cancelButtonLabel,
            children,
            modalMessage,
            modalTitle,
            okButtonClassName,
            okButtonLabel,
            onConfirm,
            ...restProps
        } = this.props;
        const { isConfirming } = this.state;

        return (
            <span className="button-toolbar">
                <button {...restProps} onClick={this.handleOpen}>
                    {children}
                </button>
                <Modal isOpened={isConfirming} onClose={this.handleClose}>
                    <button className="close" onClick={this.handleClose}></button>
                    <h1 className="modal-title">{modalTitle}</h1>
                    <p>{modalMessage}</p>
                    <p className="button-toolbar">
                        <button
                            className={okButtonClassName}
                            onClick={this.handleConfirm}>
                            {okButtonLabel}
                        </button>
                        <button
                            className={cancelButtonClassName}
                            onClick={this.handleClose}>
                            {cancelButtonLabel}
                        </button>
                    </p>
                </Modal>
            </span>
        );
    }
}
