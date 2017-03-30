import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

interface Props {
    children?: React.ReactNode;
    isOpened?: boolean;
    onClose?: () => void;
}

export default class Modal extends PureComponent<Props, {}> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        isOpened: PropTypes.bool.isRequired,
        onClose: PropTypes.func
    };

    static defaultProps = {
        isOpened: false,
    };

    componentDidMount() {
        this.refreshBodyStyles();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        this.refreshBodyStyles();
    }

    refreshBodyStyles() {
        const { isOpened } = this.props;

        if (isOpened) {
            document.body.classList.add('modal-is-opened');
            document.documentElement.classList.add('modal-is-opened');
        } else {
            document.body.classList.remove('modal-is-opened');
            document.documentElement.classList.remove('modal-is-opened');
        }
    }

    handleClick(event: any) {
        if (event.target !== event.currentTarget) {
            return;
        }

        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }
    }

    render() {
        const { children, isOpened } = this.props;

        return (
            <div>
                <div className={classnames('modal-backdrop', { 'is-opened': isOpened })} />
                <div className={classnames('modal', { 'is-opened': isOpened })}
                     onClick={this.handleClick.bind(this)}>
                    <div className="modal-dialog">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}
