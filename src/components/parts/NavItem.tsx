import React, { PureComponent } from 'react';
import classnames from 'classnames';

interface NavItemProps {
    isSelected?: boolean;
    onSelect?: (value: any) => void;
    value: any;
}

export default class NavItem extends PureComponent<NavItemProps, {}> {
    static defaultProps = {
        isSelected: false
    };

    constructor(props: NavItemProps, context: any) {
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
        const { children, isSelected } = this.props;

        return (
            <a
                className={classnames('nav-item', { 'is-selected': isSelected })}
                href="#"
                onClick={this.handleSelect}>
                {children}
            </a>
        );
    }
}
