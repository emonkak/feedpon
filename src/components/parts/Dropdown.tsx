import React, { PropTypes, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import Closable from 'components/parts/Closable';
import Menu from 'components/parts/Menu';
import createChainedFunction from 'utils/createChainedFunction';

export default class Dropdown extends PureComponent<any, any> {
    static propTypes = {
        onClose: PropTypes.func,
        onSelect: PropTypes.func,
        opened: PropTypes.bool,
        pullRight: PropTypes.bool,
        toggleButton: PropTypes.element.isRequired,
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.state = {
            opened: !!props.opened,
            pullRight: false,
        };
    }

    componentWillReceiveProps(nextProps: any) {
        if (this.props.opened !== nextProps.opened) {
            this.setState(state => ({ ...state, opened: nextProps.opened }));
        }
    }

    handleClose() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.setState(state => ({ ...state, opened: false }));
    }

    handleToggle(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { opened } = this.state;

        this.setState(state => ({ ...state, opened: !opened }));
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

        return cloneElement(toggleButton, props);
    }

    render() {
        const { children, onSelect, pullRight } = this.props;
        const { opened } = this.state;

        return (
            <div className={classnames('dropdown', { 'is-opened': opened })}>
                {this.renderToggleButton()}
                <Closable onClose={this.handleClose.bind(this)}
                          disabled={!opened}>
                    <Menu onSelect={createChainedFunction(onSelect, this.handleClose.bind(this))}
                          pullRight={pullRight}>
                        {children}
                    </Menu>
                </Closable>
            </div>
        );
    }
}
