import React, { PureComponent } from 'react';
import classnames from 'classnames';

import Modal from 'components/parts/Modal';

interface ConfirmButtonProps {
    cancelClassName?: string;
    cancelLabel?: string;
    className?: string;
    message: string;
    okClassName?: string;
    okLabel?: string;
    onConfirm: () => void;
    title: string;
}

interface ConfirmButtonState {
    isConfirming: boolean;
}

export default class ConfirmButton extends PureComponent<ConfirmButtonProps, ConfirmButtonState> {
    static defaultProps = {
        cancelClassName: 'button-outline-default',
        cancelLabel: 'Cancel',
        okClassName: 'button-positive',
        okLabel: 'OK'
    };

    constructor(props: ConfirmButtonProps, context: any) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
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

    handleOpen() {
        this.setState({
            isConfirming: true
        });
    }

    render() {
        const { cancelClassName, cancelLabel, children, className, message, okClassName, okLabel, onConfirm, title } = this.props;
        const { isConfirming } = this.state;

        return (
            <span className="button-toolbar">
                <button className={className} onClick={this.handleOpen}>
                    {children}
                </button>
                <Modal isOpened={isConfirming} onClose={this.handleClose}>
                    <button className="close" onClick={this.handleClose}></button>
                    <h1 className="modal-title">{title}</h1>
                    <p>{message}</p>
                    <p className="button-toolbar">
                        <button
                            className={classnames('button', okClassName)}
                            onClick={onConfirm}>
                            {okLabel}
                        </button>
                        <button
                            className={classnames('button', cancelClassName)}
                            onClick={this.handleClose}>
                            {cancelLabel}
                        </button>
                    </p>
                </Modal>
            </span>
        );
    }
}
