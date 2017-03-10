import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

export default class Modal extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        onClose: PropTypes.func,
        opened: PropTypes.bool,
    };

    static defaultProps = {
        opened: false,
    };

    componentDidMount() {
        this.refreshBodyStyles();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        this.refreshBodyStyles();
    }

    refreshBodyStyles() {
        const { opened } = this.props;

        if (opened) {
            document.body.classList.add('modal-is-opened');
        } else {
            document.body.classList.remove('modal-is-opened');
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
        const { children, opened } = this.props;

        return (
            <div>
                <div className={classnames('modal-backdrop', { 'is-opened': opened })} />
                <div className={classnames('modal', { 'is-opened': opened })}
                     onClick={this.handleClick.bind(this)}>
                    <div className="modal-dialog">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}
