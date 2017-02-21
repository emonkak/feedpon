import * as React from 'react';
import * as classnames from 'classnames';

export default class MenuItem extends React.PureComponent<any, any> {
    static propTypes = {
        active: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        icon: React.PropTypes.node,
        onSelect: React.PropTypes.func,
        primaryText: React.PropTypes.string,
        secondaryText: React.PropTypes.string,
    };

    handleSelect(event: any) {
        const { disabled, onSelect } = this.props;

        event.preventDefault();

        if (disabled) {
            return;
        }

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
        const { active, disabled } = this.props;

        const className = classnames('menu-item', {
            'is-disabled': disabled,
            'is-active': active,
        });

        return (
            <a className={className} href="#" onClick={this.handleSelect.bind(this)}>
               {this.renderIcon()}
               {this.renderPrimaryText()}
               {this.renderSecondaryText()}
            </a>
        );
    }
}
