import React, { PureComponent } from 'react';

interface MenuItemProps {
    icon?: React.ReactNode;
    isDisabled?: boolean;
    onSelect?: (value?: any) => void;
    primaryText: string;
    secondaryText?: string;
    value?: any;
}

export default class MenuItem extends PureComponent<MenuItemProps, {}> {
    static defaultProps = {
        isDisabled: false
    };

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
