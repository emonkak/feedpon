import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const navContext = {
    nav: PropTypes.shape({
        onSelect: PropTypes.func.isRequired
    }).isRequired
};

interface NavContext {
    nav: {
        onSelect: (value: any) => void
    };
}

interface NavProps {
    children?: React.ReactNode;
    onSelect?: (value: any) => void;
}

export class Nav extends PureComponent<NavProps, {}> {
    static defaultProps = {
        onSelect: () => ({})
    };

    static childContextTypes = navContext;

    constructor(props: NavProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    getChildContext(): NavContext {
        const { onSelect } = this.props;

        return {
            nav: { onSelect: onSelect! }
        };
    }

    handleSelect(value: any) {
        const { onSelect } = this.props;

        if (onSelect) {
            onSelect(value);
        }
    }

    render() {
        const { children } = this.props;

        return (
            <nav className="nav">
                {children}
            </nav>
        );
    }
}

interface NavItemProps {
    isSelected?: boolean;
    onSelect?: (value: any) => void;
    title?: string;
    value: any;
}

export class NavItem extends PureComponent<NavItemProps, {}> {
    static defaultProps = {
        isSelected: false
    };

    static contextTypes = navContext;

    context!: NavContext;

    constructor(props: NavItemProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { onSelect, value } = this.props;

        if (onSelect) {
            onSelect(value);
        }

        this.context.nav.onSelect(value);
    }

    render() {
        const { children, isSelected, title } = this.props;

        if (isSelected) {
            return (
                <span
                    className={classnames('nav-item', { 'is-selected': isSelected })}
                    title={title}>
                    {children}
                </span>
            );
        } else {
            return (
                <a
                    className={classnames('nav-item', { 'is-selected': isSelected })}
                    href="#"
                    title={title}
                    onClick={this.handleSelect}>
                    {children}
                </a>
            );
        }
    }
}
