import * as React from 'react';
import * as classnames from 'classnames';

export default class Modal extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node.isRequired,
        isShown: React.PropTypes.bool,
        onHide: React.PropTypes.func,
    };

    static defaultProps = {
        isShown: false,
    };

    componentDidMount() {
        this.refreshBodyStyles();
    }

    componentDidUpdate(prevProps: any, prevState: any) {
        this.refreshBodyStyles();
    }

    refreshBodyStyles() {
        const { isShown } = this.props;

        if (isShown) {
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
        const { children, isShown } = this.props;

        return (
            <div>
                <div className={classnames('modal-backdrop', { 'is-shown': isShown })} />
                <div className={classnames('modal', { 'is-shown': isShown })}
                     onClick={this.handleClick.bind(this)}>
                    <div className="modal-dialog">
                        {children}
                    </div>
                </div>
            </div>
        );
    }
}
