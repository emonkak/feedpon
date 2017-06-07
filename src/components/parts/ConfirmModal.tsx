import React, { PureComponent } from 'react';

import Modal from 'components/parts/Modal';

interface ConfirmModalProps {
    cancelButtonClassName?: string;
    cancelButtonLabel?: string;
    containerClassName?: string;
    isOpened?: boolean;
    message: string;
    okButtonClassName?: string;
    okButtonLabel?: string;
    onClose?: () => void;
    onConfirm?: () => void;
    title: string;
}

export default class ConfirmModal extends PureComponent<ConfirmModalProps, {}> {
    static defaultProps = {
        cancelButtonClassName: 'button button-outline-default',
        cancelButtonLabel: 'Cancel',
        isOpened: false,
        okButtonClassName: 'button button-outline-positive',
        okButtonLabel: 'OK'
    };

    render() {
        const {
            cancelButtonClassName,
            cancelButtonLabel,
            isOpened,
            message,
            okButtonClassName,
            okButtonLabel,
            onClose,
            onConfirm,
            title
        } = this.props;

        return (
            <Modal isOpened={isOpened} onClose={onClose}>
                <button className="close u-pull-right" onClick={onClose}></button>
                <h1 className="modal-title">{title}</h1>
                <p>{message}</p>
                <p className="button-toolbar">
                    <button className={okButtonClassName} onClick={onConfirm}>{okButtonLabel}</button>
                    <button className={cancelButtonClassName} onClick={onClose}>{cancelButtonLabel}</button>
                </p>
            </Modal>
        );
    }
}
