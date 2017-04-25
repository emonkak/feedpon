import React, { PureComponent } from 'react';

interface MenuItemProps {
    isDisabled?: boolean;
    icon?: React.ReactNode;
    onSelect?: () => void;
    primaryText?: React.ReactNode;
    secondaryText?: React.ReactNode;
}

export default class MenuItem extends PureComponent<MenuItemProps, {}> {
    static defaultProps = {
        isDisabled: false
    };

    handleSelect(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onSelect } = this.props;

        if (onSelect) {
            onSelect();
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
