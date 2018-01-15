import CSSTransitionGroup from 'react-addons-css-transition-group';
import React, { PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
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
    left: string | null;
    right: string | null;
    bottom: string | null;
    top: string | null;
    maxHeight: string | null;
    maxWidth: string | null;
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        component: 'div',
    };

    private _menu: Menu | null;

    constructor(props: DropdownProps, context: any) {
        super(props, context);

        this.state = {
            isOpened: false,
            top: null,
            bottom: null,
            left: null,
            right: null,
            maxWidth: null,
            maxHeight: null
        };
    }

    render() {
        const { className, component } = this.props;
        const { isOpened, top, right, left, bottom, maxWidth, maxHeight } = this.state;

        const Component = component!;

        return (
            <Component className={classnames('dropdown', className)}>
                {this._renderToggleButton()}
                <CSSTransitionGroup
                    component="div"
                    className="dropdown-menu"
                    style={{
                        left,
                        right,
                        top,
                        bottom,
                        maxWidth,
                        maxHeight
                    }}
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

        let left: string | null = null;
        let right: string | null = null;
        let top: string | null = null;
        let bottom: string | null = null;
        let maxWidth: string | null = null;
        let maxHeight: string | null = null;

        if (leftSpace <= rightSpace) {
            left = containerRect.left + 'px';
            maxWidth = `calc(100% - ${containerRect.left}px)`;
        } else {
            right = `calc(100% - ${containerRect.right}px)`;
            maxWidth = `calc(100% - (100% - ${containerRect.right}px))`;
        }

        if (topSpace <= bottomSpace) {
            top = containerRect.bottom + 'px';
            maxHeight = `calc(100% - ${containerRect.bottom}px)`;
        } else {
            bottom = `calc(100% - ${containerRect.top}px)`;
            maxHeight = `calc(100% - (100% - ${containerRect.top}px))`;
        }

        this.setState({
            isOpened: true,
            left,
            right,
            top,
            bottom,
            maxWidth,
            maxHeight
        });
    }

    private _closeDropdown() {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this.setState({
            isOpened: false,
        });
    }

    private _handleMenuRef = (menu: Menu | null): void => {
        this._menu = menu;
    };

    private _handleClose = (): void => {
        const { onClose } = this.props;

        if (onClose) {
            onClose();
        }

        this._closeDropdown();
    };

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
    };

    private _handleSelect = (value?: any): void => {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this._closeDropdown();
    };

    private _handleToggle = (event: React.MouseEvent<any>): void => {
        event.preventDefault();

        const { isOpened } = this.state;

        if (isOpened) {
            this._closeDropdown();
        } else{
            this._openDropdown();
        }
    };
}
