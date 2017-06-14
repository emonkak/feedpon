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
    }

    componentDidMount() {
        this.refreshBodyStyles(this.props.isOpened!);
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        this.refreshBodyStyles(this.props.isOpened!);
    }

    componentWillUnmount() {
        this.refreshBodyStyles(false);
    }

    refreshBodyStyles(isOpened: boolean) {
        if (isOpened) {
            document.body.classList.add('modal-is-opened');
            document.documentElement.classList.add('modal-is-opened');
        } else {
            document.body.classList.remove('modal-is-opened');
            document.documentElement.classList.remove('modal-is-opened');
        }
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
