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

    constructor(props: MenuProps, context: any) {
        super(props, context);

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

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

    handleKeyDown(event: React.KeyboardEvent<any>) {
        const { onKeyDown } = this.props;
        const target = event.target as Element;

        const DENY_TAG_NAMES = ['INPUT', 'SELECT', 'TEXTAREA'];

        if (onKeyDown && !DENY_TAG_NAMES.includes(target.tagName)) {
            onKeyDown(event);
        }
    }

    render() {
        const { children } = this.props;

        return (
            <div tabIndex={0} className="menu" onKeyDown={this.handleKeyDown}>
                {children}
            </div>
        );
    }
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

export class MenuItem extends PureComponent<MenuItemProps, {}> {
    static defaultProps = {
        href: '#',
        isDisabled: false
    };

    static contextTypes = menuContext;

    context: MenuContext;

    constructor(props: MenuItemProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(event: React.MouseEvent<any>) {
        const { onSelect, value, href } = this.props;

        if (href === '#') {
            event.preventDefault();
        }

        if (onSelect) {
            onSelect(value);
        }

        this.context.menu.onSelect(value);
    }

    render() {
        const { href, icon, isDisabled, primaryText, secondaryText, target } = this.props;

        const iconElement = icon ? <span className="menu-item-icon">{icon}</span> : null;
        const primaryTextElement = <span className="menu-item-primary-text">{primaryText}</span>;
        const secondaryTextElement = <span className="menu-item-secondary-text">{secondaryText}</span>;

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

interface MenuFormProps {
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export class MenuForm extends PureComponent<MenuFormProps, {}> {
    static contextTypes = menuContext;

    context: MenuContext;

    constructor(props: MenuFormProps, context: any) {
        super(props, context);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const { onSubmit } = this.props;

        if (onSubmit) {
            onSubmit(event);
        }

        this.context.menu.onClose();
    }

    render() {
        const { children } = this.props;

        return (
            <form
                className="menu-form"
                onSubmit={this.handleSubmit}>
                {children}
            </form>
        );
    }
}
