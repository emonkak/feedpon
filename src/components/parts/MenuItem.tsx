import React, { PureComponent } from 'react';

interface MenuItemProps {
    icon?: React.ReactNode;
    isDisabled?: boolean;
    onSelect?: (value?: any) => void;
    primaryText?: React.ReactNode;
    secondaryText?: React.ReactNode;
    value?: any;
}

export default class MenuItem extends PureComponent<MenuItemProps, {}> {
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

    renderIcon() {
        const { icon } = this.props;

        if (!icon) {
            return null;
        }

        return (
            <span className="menu-item-icon">{icon}</span>
        );
    }

    renderPrimaryText() {
        const { primaryText } = this.props;

        if (!primaryText) {
            return null;
        }

        return (
            <span className="menu-item-primary-text">{primaryText}</span>
        );
    }

    renderSecondaryText() {
        const { secondaryText } = this.props;

        if (!secondaryText) {
            return null;
        }

        return (
            <span className="menu-item-secondary-text">{secondaryText}</span>
        );
    }

    render() {
        const { isDisabled } = this.props;

        if (isDisabled) {
            return (
                <div className="menu-item is-disabled">
                    {this.renderIcon()}
                    {this.renderPrimaryText()}
                    {this.renderSecondaryText()}
                </div>
            );
        } else {
            return (
                <a
                    className="menu-item"
                    href="#"
                    onClick={this.handleSelect.bind(this)}>
                    {this.renderIcon()}
                    {this.renderPrimaryText()}
                    {this.renderSecondaryText()}
                </a>
            );
        }
    }
}
