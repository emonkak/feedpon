import React, { PureComponent, cloneElement } from 'react';

import createChainedFunction from 'utils/createChainedFunction';

interface ModalButtonProps {
    button: React.ReactElement<any>;
    className?: string;
    component?: string;
    modal: React.ReactElement<any>;
}

interface ModalButtonState {
    isShowing: boolean;
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
            isShowing: false
        };
    }

    handleClose() {
        this.setState({
            isShowing: false
        });
    }

    handleOpen() {
        this.setState({
            isShowing: true
        });
    }

    render() {
        const { button, className, component, modal } = this.props;
        const { isShowing } = this.state;

        const Component = component!;

        const buttonElement = cloneElement(button, {
            onClick: createChainedFunction(
                button.props.onClick,
                this.handleOpen
            )
        });

        const modalElement = cloneElement(modal, {
            isOpened: isShowing,
            onClose: createChainedFunction(
                modal.props.onClose,
                this.handleClose
            )
        })

        return (
            <Component className={className}>
                {buttonElement}
                {modalElement}
            </Component>
        );
    }
}
