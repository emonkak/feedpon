import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';

import Closable from 'components/parts/Closable';
import createChainedFunction from 'utils/createChainedFunction';
import { Menu } from 'components/parts/Menu';

interface DropdownProps {
    className?: string;
    isOpened?: boolean;
    onClose?: () => void;
    onSelect?: (value?: any) => void;
    pullRight?: boolean;
    toggleButton: React.ReactElement<any>;
}

interface DropdownState {
    isOpened: boolean;
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        isOpened: false,
        pullRight: false
    };

    constructor(props: DropdownProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: props.isOpened!
        };

        this.handleClose = this.handleClose.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleToggle = this.handleToggle.bind(this);
    }

    componentWillReceiveProps(nextProps: DropdownProps) {
        if (this.props.isOpened !== nextProps.isOpened) {
            this.setMenu(nextProps.isOpened!);
        }
    }

    handleClose() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.setMenu(false);
    }

    handleSelect(value?: any) {
        const { onClose, onSelect } = this.props;

        if (onClose) {
            onClose();
        }

        if (onSelect) {
            onSelect(value);
        }

        this.setMenu(false);
    }

    handleToggle(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isOpened } = this.state;

        this.setMenu(!isOpened);
    }

    setMenu(isOpened: boolean) {
        this.setState({ isOpened });
    }

    renderToggleButton() {
        const { toggleButton } = this.props;

        const props = {
            ...toggleButton.props,
            onClick: createChainedFunction(
                toggleButton.props.onClick,
                this.handleToggle
            ),
        };

        return cloneElement(toggleButton, props);
    }

    render() {
        const { children, className, pullRight } = this.props;
        const { isOpened } = this.state;

        return (
            <div className={classnames('dropdown', className, {
                'is-opened': isOpened!,
                'is-pull-right': pullRight!
            })}>
                {this.renderToggleButton()}
                <Closable
                    onClose={this.handleClose}
                    isDisabled={!isOpened}>
                    <Menu onSelect={this.handleSelect} onClose={this.handleClose}>
                        {children}
                    </Menu>
                </Closable>
            </div>
        );
    }
}
