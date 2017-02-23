import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

export default class Modal extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node.isRequired,
        onHide: PropTypes.func,
        shown: PropTypes.bool,
    };

    static defaultProps = {
        shown: false,
    };

    componentDidMount() {
        this.refreshBodyStyles();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        this.refreshBodyStyles();
    }

    refreshBodyStyles() {
        const { shown } = this.props;

        if (shown) {
            const scrollbarWidth = window.innerWidth - document.body.clientWidth;
            document.body.style.paddingRight = scrollbarWidth + 'px';
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }
    }

    handleClick(event: any) {
        if (event.target !== event.currentTarget) {
            return;
        }

        const { onHide } = this.props;

        if (onHide) {
            onHide();
        }
    }

    render() {
        const { children, shown } = this.props;

        return (
            <div>
                <div className={classnames('modal-backdrop', { 'is-shown': shown })} />
                <div className={classnames('modal', { 'is-shown': shown })}
                     onClick={this.handleClick.bind(this)}>
                    <div className="modal-dialog">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}
