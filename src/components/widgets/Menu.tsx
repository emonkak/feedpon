import React, { Children, PureComponent, cloneElement, isValidElement } from 'react';
import { findDOMNode } from 'react-dom';

interface MenuProps {
    children?: React.ReactNode;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
}

interface MenuDelegateProps {
    delegate?: (value?: any) => void;
}

interface MenuItemProps extends MenuDelegateProps {
    delegate?: (value?: any) => void;
    href?: string;
    icon?: React.ReactNode;
    isDisabled?: boolean;
    onSelect?: (value?: any) => void;
    primaryText: string;
    secondaryText?: string;
    target?: string;
    value?: any;
}

interface MenuFormProps extends MenuDelegateProps {
    delegate?: (value?: any) => void;
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

const KEY_EVENTS_TO_IGNORE = ['INPUT', 'SELECT', 'TEXTAREA'];

export class Menu extends PureComponent<MenuProps, {}> {
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
                {Children.map(children, this._renderChild)}
            </div>
        );
    }

    private _getFocusableElements(): { activeIndex: number, elements: HTMLElement[] } {
        const container = findDOMNode(this) as Element;
        if (!container) {
            return { activeIndex: -1, elements: [] };
        }

        const elements = Array.from(container.querySelectorAll<HTMLElement>('.menu-item:not(.is-disabled)'));

        const { activeElement } = document;
        const activeIndex = elements.findIndex((el) => el.contains(activeElement));

        return { activeIndex, elements };
    }

    private _renderChild = (child: React.ReactNode) => {
        if (isValidElement(child) &&
            (child.type === MenuItem as any ||
             child.type === MenuForm as any)) {
            return cloneElement<MenuDelegateProps>(child, {
                delegate: this.props.onSelect
            });
        }

        return child;
    }

    private _handleKeyDown = (event: React.KeyboardEvent<any>): void => {
        const { onKeyDown } = this.props;
        const target = event.target as Element;

        if (onKeyDown && !KEY_EVENTS_TO_IGNORE.includes(target.tagName)) {
            onKeyDown(event);
        }
    }
}

export class MenuItem extends PureComponent<MenuItemProps, {}> {
    static defaultProps = {
        href: '#',
        isDisabled: false
    };

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
        const { delegate, href, onSelect, value } = this.props;

        if (href === '#') {
            event.preventDefault();
        }

        if (onSelect) {
            onSelect(value);
        }

        if (delegate) {
            delegate(value);
        }
    }
}

export class MenuForm extends PureComponent<MenuFormProps, {}> {
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

        const { delegate, onSubmit } = this.props;

        if (onSubmit) {
            onSubmit(event);
        }

        if (delegate) {
            delegate();
        }
    }
};
