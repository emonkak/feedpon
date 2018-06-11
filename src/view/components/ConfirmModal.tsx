import React, { PureComponent } from 'react';

import Modal from 'view/components/Modal';

interface ConfirmModalProps {
    cancelButtonClassName?: string;
    cancelButtonLabel?: string;
    confirmButtonClassName?: string;
    confirmButtonLabel?: string;
    containerClassName?: string;
    isOpened?: boolean;
    message: string;
    onCancel?: () => void;
    onClose?: () => void;
    onConfirm?: () => void;
    title: string;
}

export default class ConfirmModal extends PureComponent<ConfirmModalProps> {
    static defaultProps = {
        cancelButtonClassName: 'button button-outline-default',
        cancelButtonLabel: 'Cancel',
        confirmButtonClassName: 'button button-outline-positive',
        confirmButtonLabel: 'OK',
        isOpened: false
    };

    constructor(props: ConfirmModalProps) {
        super(props);

        this.handleCancel = this.handleCancel.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
    }

    handleCancel() {
        const { onClose, onCancel } = this.props;

        if (onCancel) {
            onCancel();
        }

        if (onClose) {
            onClose();
        }
    }

    handleConfirm() {
        const { onClose, onConfirm } = this.props;

        if (onConfirm) {
            onConfirm();
        }

        if (onClose) {
            onClose();
        }
    }

    render() {
        const {
            cancelButtonClassName,
            cancelButtonLabel,
            isOpened,
            message,
            confirmButtonClassName,
            confirmButtonLabel,
            onClose,
            title
        } = this.props;

        return (
            <Modal isOpened={isOpened} onClose={onClose}>
                <button className="close u-pull-right" onClick={onClose}></button>
                <h1 className="modal-title">{title}</h1>
                <p>{message}</p>
                <p className="button-toolbar">
                    <button autoFocus className={confirmButtonClassName} onClick={this.handleConfirm}>{confirmButtonLabel}</button>
                    <button className={cancelButtonClassName} onClick={this.handleCancel}>{cancelButtonLabel}</button>
                </p>
            </Modal>
        );
    }
}
