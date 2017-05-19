import React, { Children, PureComponent, cloneElement } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import createChainedFunction from 'utils/createChainedFunction';

interface MenuProps {
    className?: string;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
    pullRight?: boolean;
}

export class Menu extends PureComponent<MenuProps, {}> {
    static defaultProps = {
        pullRight: false
    };

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

    renderChild(child: React.ReactElement<any>) {
        if (child.type === MenuItem) {
            const { onSelect } = this.props;

            return cloneElement(child, {
                ...child.props,
                onSelect: createChainedFunction(
                    child.props.onSelect,
                    onSelect
                )
            });
        }

        if (child.type === MenuForm) {
            const { onClose } = this.props;

            return cloneElement(child, {
                ...child.props,
                onSubmit: createChainedFunction(
                    child.props.onSubmit,
                    onClose
                )
            });
        }

        return child;
    }

    render() {
        const { children, className, onKeyDown, pullRight } = this.props;

        return (
            <div className={classnames(className, 'menu', { 'menu-pull-right': pullRight! })}
                 onKeyDown={onKeyDown}>
                {Children.toArray(children).map(this.renderChild, this)}
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

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSelect, value } = this.props;

        if (onSelect) {
            onSelect(value);
        }
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
                <a className="menu-item"
                   title={primaryText}
                   href="#"
                   onClick={this.handleSelect.bind(this)}>
                    {iconElement}
                    {primaryTextElement}
                    {secondaryTextElement}
                </a>
            );
        }
    }
}

interface MenuFormProps {
    onSubmit?: () => void;
}

export class MenuForm extends PureComponent<MenuFormProps, {}> {
    constructor(props: MenuFormProps, context: any) {
        super(props, context);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    handleSubmit(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSubmit } = this.props;

        if (onSubmit) {
            onSubmit();
        }
    }

    handleKeyDown(event: React.KeyboardEvent<any>) {
        event.stopPropagation();
    }

    render() {
        const { children } = this.props;

        return (
            <form className="menu-form"
                  onKeyDown={this.handleKeyDown}
                  onSubmit={this.handleSubmit}>
                {children}
            </form>
        );
    }
}
