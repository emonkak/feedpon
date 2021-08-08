import CSSTransition from 'react-transition-group/CSSTransition';
import React, { PureComponent, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';

import Closable from 'view/components/Closable';
import { Menu } from 'view/components/Menu';

interface DropdownProps {
    className?: string;
    component?: React.ReactType;
    onClose?: () => void;
    onSelect?: (value?: any) => void;
    toggleButton: React.ReactElement<any>;
}

interface DropdownState {
    isOpened: boolean;
    isEntered: boolean;
    dropdownStyle: React.CSSProperties;
}

export default class Dropdown extends PureComponent<DropdownProps, DropdownState> {
    static defaultProps = {
        component: 'div'
    };

    private _menu: Menu | null = null;

    constructor(props: DropdownProps) {
        super(props);

        this.state = {
            isOpened: false,
            isEntered: false,
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
                <CSSTransition
                    in={isOpened}
                    mountOnEnter
                    unmountOnExit
                    classNames="menu"
                    timeout={200}
                    onEntered={this._handleTransitionEntered}
                    onExited={this._handleTransitionExited}
                >
                    <div className="dropdown" style={dropdownStyle}>
                        {this._renderMenu()}
                    </div>
                </CSSTransition>
            </Component>
        );
    }

    private _renderToggleButton() {
        const { toggleButton } = this.props;

        return cloneElement(toggleButton, {
            onClick: this._handleToggle,
            onKeyDown: this._handleKeyDown
        });
    }

    private _renderMenu() {
        const { children } = this.props;
        const { isEntered } = this.state;

        return (
            <Closable isDisabled={!isEntered} onClose={this._handleClose}>
                <Menu
                    ref={this._handleMenuRef}
                    onKeyDown={this._handleKeyDown}
                    onSelect={this._handleSelect}>
                    {children}
                </Menu>
            </Closable>
        );
    }

    private _openDropdown() {
        const container = findDOMNode(this) as Element;
        if (!container) {
            return;
        }

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
        if (this._menu) {
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

        const { toggleButton } = this.props;
        if (toggleButton.props.onKeyDown) {
            toggleButton.props.onKeyDown(event);
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

        const { toggleButton } = this.props;
        if (toggleButton.props.onClick) {
            toggleButton.props.onClick(event);
        }
    }

    private _handleTransitionEntered = () => {
        this.setState({
            isEntered: true
        });
    }

    private _handleTransitionExited = () => {
        this.setState({
            isEntered: false
        });
    }
}
