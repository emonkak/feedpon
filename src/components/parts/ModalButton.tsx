import React, { PureComponent, cloneElement } from 'react';

import Portal from 'components/parts/Portal';
import createChainedFunction from 'utils/createChainedFunction';

interface ModalButtonProps {
    button: React.ReactElement<any>;
    modal: React.ReactElement<any>;
}

interface ModalButtonState {
    modalIsOpened: boolean;
}

export default class ModalButton extends PureComponent<ModalButtonProps, ModalButtonState> {
    static defaultProps = {
        component: 'div'
    };

    constructor(props: ModalButtonProps, context: any) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);

        this.state = {
            modalIsOpened: false
        };
    }

    handleClose() {
        this.setState({
            modalIsOpened: false
        });
    }

    handleOpen() {
        this.setState({
            modalIsOpened: true
        });
    }

    render() {
        const { button, modal } = this.props;
        const { modalIsOpened } = this.state;

        const buttonElement = cloneElement(button, {
            onClick: createChainedFunction(
                button.props.onClick,
                this.handleOpen
            )
        });

        const modalElement = cloneElement(modal, {
            isOpened: modalIsOpened,
            onClose: createChainedFunction(
                modal.props.onClose,
                this.handleClose
            )
        })

        return (
            <Portal overlay={modalElement}>
                {buttonElement}
            </Portal>
        );
    }
}
