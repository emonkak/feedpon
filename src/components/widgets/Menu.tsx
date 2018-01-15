import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Link } from 'react-router';
import { findDOMNode } from 'react-dom';

interface MenuContext {
    menu: {
        onClose: () => void,
        onSelect: (value: any) => void
    }
}

interface MenuProps {
    children?: React.ReactNode;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
}

interface MenuItemProps {
    href?: string;
    icon?: React.ReactNode;
    isDisabled?: boolean;
    onSelect?: (value?: any) => void;
    primaryText: string;
    secondaryText?: string;
    target?: string;
    value?: any;
}

interface MenuLinkProps {
    icon?: React.ReactNode;
    isDisabled?: boolean;
    primaryText: string;
    secondaryText?: string;
    to: string;
}

interface MenuFormProps {
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

const menuContext = {
    menu: PropTypes.shape({
        onClose: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired
    }).isRequired
};

export class Menu extends PureComponent<MenuProps, {}> {
    static defaultProps = {
        onClose: () => ({}),
        onSelect: () => ({})
    };

    static childContextTypes = menuContext;

    getChildContext(): MenuContext {
        const { onClose, onSelect } = this.props;

        return {
            menu: {
                onClose: onClose!,
                onSelect: onSelect!
            }
        };
    }

    focusPrevious(): void {
        const { activeIndex, elements } = this._getFocusableElements();

        if (elements.length > 0) {
            const previousIndex = activeIndex > 0 ? activeIndex - 1 : elements.length - 1;
            const previousElement = elements[previousIndex];
            previousElement.focus();
        }
    }

    focusNext(): void {
        const { activeIndex, elements } = this._getFocusableElements();

        if (elements.length > 0) {
            const nextIndex = activeIndex < elements.length - 1 ? activeIndex + 1 : 0;
            const nextElement = elements[nextIndex];
            nextElement.focus();
        }
    }

    render() {
        const { children } = this.props;

        return (
            <div tabIndex={0} className="menu" onKeyDown={this._handleKeyDown}>
                {children}
            </div>
        );
    }

    private _getFocusableElements(): { activeIndex: number, elements: HTMLElement[] } {
        const container = findDOMNode(this);
        const elements = Array.from(container.querySelectorAll<HTMLElement>('.menu-item:not(.is-disabled)'));

        const { activeElement } = document;
        const activeIndex = elements.findIndex((el) => el.contains(activeElement));

        return { activeIndex, elements };
    }

    private _handleKeyDown = (event: React.KeyboardEvent<any>): void => {
        const { onKeyDown } = this.props;
        const target = event.target as Element;

        const DENY_TAG_NAMES = ['INPUT', 'SELECT', 'TEXTAREA'];

        if (onKeyDown && !DENY_TAG_NAMES.includes(target.tagName)) {
            onKeyDown(event);
        }
    }
}

export class MenuItem extends PureComponent<MenuItemProps, {}> {
    static defaultProps = {
        href: '#',
        isDisabled: false
    };

    static contextTypes = menuContext;

    context: MenuContext;

    render() {
        const { href, icon, isDisabled, primaryText, secondaryText, target } = this.props;

        const iconElement = icon && <span className="menu-item-icon">{icon}</span>;
        const primaryTextElement = <span className="menu-item-primary-text">{primaryText}</span>;
        const secondaryTextElement = secondaryText && <span className="menu-item-secondary-text">{secondaryText}</span>;

        if (isDisabled) {
            return (
                <div className="menu-item is-disabled" title={primaryText}>
                    {iconElement}
                    {primaryTextElement}
                    {secondaryTextElement}
                </div>
            );
        } else {
            return (
                <a
                    className="menu-item"
                    title={primaryText}
                    target={target}
                    href={href}
                    onClick={this._handleSelect}>
                    {iconElement}
                    {primaryTextElement}
                    {secondaryTextElement}
                </a>
            );
        }
    }

    private _handleSelect = (event: React.MouseEvent<any>): void => {
        const { onSelect, value, href } = this.props;

        if (href === '#') {
            event.preventDefault();
        }

        if (onSelect) {
            onSelect(value);
        }

        this.context.menu.onSelect(value);
    }
}

export class MenuLink extends PureComponent<MenuLinkProps, {}> {
    static defaultProps = {
        isDisabled: false
    };

    static contextTypes = menuContext;

    context: MenuContext;

    render() {
        const { icon, isDisabled, primaryText, secondaryText, to } = this.props;

        const iconElement = icon && <span className="menu-item-icon">{icon}</span>;
        const primaryTextElement = <span className="menu-item-primary-text">{primaryText}</span>;
        const secondaryTextElement = secondaryText && <span className="menu-item-secondary-text">{secondaryText}</span>;

        if (isDisabled) {
            return (
                <div className="menu-item is-disabled" title={primaryText}>
                    {iconElement}
                    {primaryTextElement}
                    {secondaryTextElement}
                </div>
            );
        } else {
            return (
                <Link
                    className="menu-item"
                    title={primaryText}
                    to={to}
                    onClick={this.context.menu.onSelect}>
                    {iconElement}
                    {primaryTextElement}
                    {secondaryTextElement}
                </Link>
            );
        }
    }
}

export class MenuForm extends PureComponent<MenuFormProps, {}> {
    static contextTypes = menuContext;

    context: MenuContext;

    render() {
        const { children } = this.props;

        return (
            <form
                className="menu-form"
                onSubmit={this._handleSubmit}>
                {children}
            </form>
        );
    }

    private _handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        const { onSubmit } = this.props;

        if (onSubmit) {
            onSubmit(event);
        }

        this.context.menu.onClose();
    }
}
