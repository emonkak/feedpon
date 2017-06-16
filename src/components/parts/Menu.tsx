import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Link } from 'react-router';
import { findDOMNode } from 'react-dom';

const menuContext = {
    menu: PropTypes.shape({
        onClose: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired
    }).isRequired
};

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

    focusPrevious() {
        const { activeIndex, elements } = this.getFocusableElements();

        if (elements.length > 0) {
            const previousIndex = activeIndex > 0 ? activeIndex - 1 : elements.length - 1;
            const previousElement = elements[previousIndex];

            if (previousElement instanceof HTMLElement) {
                previousElement.focus();
            }
        }
    }

    focusNext() {
        const { activeIndex, elements } = this.getFocusableElements();

        if (elements.length > 0) {
            const nextIndex = activeIndex < elements.length - 1 ? activeIndex + 1 : 0;
            const nextElement = elements[nextIndex];

            if (nextElement instanceof HTMLElement) {
                nextElement.focus();
            }
        }
    }

    getFocusableElements() {
        const container = findDOMNode(this);
        const elements = Array.from(container.querySelectorAll('.menu-item:not(.is-disabled)'));

        const { activeElement } = document;
        const activeIndex = elements.findIndex((el) => el.contains(activeElement));

        return { activeIndex, elements };
    }

    render() {
        const { children, onKeyDown } = this.props;

        return (
            <div className="menu" onKeyDown={onKeyDown}>
                {children}
            </div>
        );
    }
}

interface MenuItemProps {
    icon?: React.ReactNode;
    isDisabled?: boolean;
    onSelect?: (value?: any) => void;
    primaryText: string;
    secondaryText?: string;
    value?: any;
}

export class MenuItem extends PureComponent<MenuItemProps, {}> {
    static defaultProps = {
        isDisabled: false
    };

    static contextTypes = menuContext;

    context: MenuContext;

    constructor(props: MenuItemProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSelect, value } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this.context.menu.onSelect(value);
    }

    render() {
        const { icon, isDisabled, primaryText, secondaryText } = this.props;

        const iconElement = icon ? <span className="menu-item-icon">{icon}</span> : null;
        const primaryTextElement = <span className="menu-item-primary-text">{primaryText}</span>;
        const secondaryTextElement = <span className="menu-item-secondary-text">{secondaryText}</span>;

        if (isDisabled) {
            return (
                <div className="menu-item is-disabled"
                     title={primaryText}>
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
                    href="#"
                    onClick={this.handleSelect}>
                    {iconElement}
                    {primaryTextElement}
                    {secondaryTextElement}
                </a>
            );
        }
    }
}

interface MenuLinkProps {
    icon?: React.ReactNode;
    isDisabled?: boolean;
    primaryText: string;
    secondaryText?: string;
    to: string;
}

export class MenuLink extends PureComponent<MenuLinkProps, {}> {
    static defaultProps = {
        isDisabled: false
    };

    static contextTypes = menuContext;

    context: MenuContext;

    render() {
        const { icon, isDisabled, primaryText, secondaryText, to } = this.props;

        const iconElement = icon ? <span className="menu-item-icon">{icon}</span> : null;
        const primaryTextElement = <span className="menu-item-primary-text">{primaryText}</span>;
        const secondaryTextElement = <span className="menu-item-secondary-text">{secondaryText}</span>;

        if (isDisabled) {
            return (
                <div className="menu-item is-disabled"
                     title={primaryText}>
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

interface MenuFormProps {
    onSubmit?: () => void;
}

export class MenuForm extends PureComponent<MenuFormProps, {}> {
    static contextTypes = menuContext;

    context: MenuContext;

    constructor(props: MenuFormProps, context: any) {
        super(props, context);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleSubmit(event: React.FormEvent<any>) {
        event.preventDefault();

        const { onSubmit } = this.props;

        if (onSubmit) {
            onSubmit();
        }

        this.context.menu.onClose();
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        event.stopPropagation();
    }

    render() {
        const { children } = this.props;

        return (
            <form
                className="menu-form"
                onKeyDown={this.handleKeyDown}
                onSubmit={this.handleSubmit}>
                {children}
            </form>
        );
    }
}
