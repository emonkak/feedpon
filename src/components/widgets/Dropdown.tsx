import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PureComponent, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';

import Closable from 'components/widgets/Closable';
import createChainedFunction from 'utils/createChainedFunction';
import { Menu } from 'components/widgets/Menu';

interface DropdownProps {
    className?: string;
    component?: React.ReactType;
    onClose?: () => void;
    onSelect?: (value?: any) => void;
    toggleButton: React.ReactElement<any>;
}

interface DropdownState {
    isOpened: boolean;
    dropdownStyle: React.CSSProperties;
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        component: 'div'
    };

    private _menu: Menu | null = null;

    constructor(props: DropdownProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: false,
            dropdownStyle: {}
        };
    }

    render() {
        const { className, component } = this.props;
        const { isOpened, dropdownStyle } = this.state;

        const Component = component!;

        return (
            <Component className={className}>
                {this._renderToggleButton()}
                <CSSTransitionGroup
                    component="div"
                    className="dropdown"
                    style={dropdownStyle}
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                    transitionName="menu">
                    {isOpened ? this._renderMenu() : null}
                </CSSTransitionGroup>
            </Component>
        );
    }

    private _renderToggleButton() {
        const { toggleButton } = this.props;

        return cloneElement(toggleButton, {
            ...toggleButton.props,
            onClick: createChainedFunction(
                toggleButton.props.onClick,
                this._handleToggle
            ),
            onKeyDown: createChainedFunction(
                toggleButton.props.onKeyDown,
                this._handleKeyDown
            )
        });
    }

    private _renderMenu() {
        const { children } = this.props;

        return (
            <Closable onClose={this._handleClose}>
                <Menu
                    ref={this._handleMenuRef}
                    onKeyDown={this._handleKeyDown}
                    onSelect={this._handleSelect}
                    onClose={this._handleClose}>
                    {children}
                </Menu>
            </Closable>
        );
    }

    private _openDropdown() {
        const container = findDOMNode(this);
        const containerRect = container.getBoundingClientRect();
        const viewportHeight =  window.innerHeight;
        const viewportWidth = window.innerWidth;

        const topSpace = containerRect.top;
        const bottomSpace = viewportHeight - containerRect.bottom;
        const leftSpace = containerRect.left;
        const rightSpace = viewportWidth - containerRect.right;

        let dropdownStyle: React.CSSProperties = {};

        if (leftSpace <= rightSpace) {
            dropdownStyle.left = containerRect.left;
            dropdownStyle.maxWidth = `calc(100% - ${containerRect.left}px)`;
        } else {
            dropdownStyle.right = `calc(100% - ${containerRect.right}px)`;
            dropdownStyle.maxWidth = `calc(100% - (100% - ${containerRect.right}px))`;
        }

        if (topSpace <= bottomSpace) {
            dropdownStyle.top = containerRect.bottom;
            dropdownStyle.maxHeight = `calc(100% - ${containerRect.bottom}px)`;
        } else {
            dropdownStyle.bottom = `calc(100% - ${containerRect.top}px)`;
            dropdownStyle.maxHeight = `calc(100% - (100% - ${containerRect.top}px))`;
        }

        this.setState({
            isOpened: true,
            dropdownStyle
        });
    }

    private _closeDropdown() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.setState({
            isOpened: false
        });
    }

    private _handleMenuRef = (menu: Menu | null): void => {
        this._menu = menu;
    }

    private _handleClose = (): void => {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this._closeDropdown();
    }

    private _handleKeyDown = (event: React.KeyboardEvent<any>): void => {
        if (!this._menu) {
            return;
        }

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
                this._menu.focusPrevious();
                break;

            case 'ArrowDown':
                event.preventDefault();
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
                this._menu.focusNext();
                break;

            case 'Escape':
                event.preventDefault();
                event.stopPropagation();
                event.nativeEvent.stopImmediatePropagation();
                this._handleClose();
                break;
        }
    }

    private _handleSelect = (value?: any): void => {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this._closeDropdown();
    }

    private _handleToggle = (event: React.MouseEvent<any>): void => {
        event.preventDefault();

        const { isOpened } = this.state;

        if (isOpened) {
            this._closeDropdown();
        } else {
            this._openDropdown();
        }
    }
}
