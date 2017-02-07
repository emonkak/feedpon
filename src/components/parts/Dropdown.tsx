import * as React from 'react';
import * as classnames from 'classnames';

import Menu from 'components/parts/Menu';
import createChainedFunction from 'utils/createChainedFunction';

export default class Dropdown extends React.PureComponent<any, any> {
    static propTypes = {
        isOpened: React.PropTypes.bool,
        onClose: React.PropTypes.func,
        onSelect: React.PropTypes.func,
        pullRight: React.PropTypes.bool,
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            isOpened: !!props.isOpened,
            pullRight: false,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.isOpened !== nextProps.isOpened) {
            this.setState(state => ({ ...state, isOpened: nextProps.isOpened }));
        }
    }

    handleClose() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.setState(state => ({ ...state, isOpened: false }));
    }

    handleToggle(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { isOpened } = this.state;

        this.setState(state => ({ ...state, isOpened: !isOpened }));
    }

    renderToggleButton() {
        const { toggleButton } = this.props;

        const props = {
            ...toggleButton.props,
            onClick: createChainedFunction(
                toggleButton.props.onClick,
                this.handleToggle.bind(this)
            ),
        };

        return React.cloneElement(toggleButton, props);
    }

    render() {
        const { children, onSelect, pullRight } = this.props;
        const { isOpened } = this.state;

        return (
            <div className={classnames('dropdown', { 'is-opened': isOpened })}>
                {this.renderToggleButton()}
                <Menu onCancel={this.handleClose.bind(this)}
                      onSelect={createChainedFunction(onSelect, this.handleClose.bind(this))}
                      pullRight={pullRight}
                      isDisabled={!isOpened}>
                    {children}
                </Menu>
            </div>
        );
    }
}
