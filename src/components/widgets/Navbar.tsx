import React, { PureComponent } from 'react';

interface NavbarProps {
    children?: React.ReactNode;
    onToggleSidebar?: () => void;
}

export default class Navbar extends PureComponent<NavbarProps, {}> {
    constructor(props: NavbarProps, context: any) {
        super(props, context);

        this.handleToggleSidebar = this.handleToggleSidebar.bind(this);
    }

    handleToggleSidebar(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { onToggleSidebar } = this.props;

        if (onToggleSidebar) {
            onToggleSidebar();
        }
    }

    render() {
        const { children } = this.props;

        return (
            <nav className="navbar">
                <div className="navbar-container">
                    <button className="navbar-action" onClick={this.handleToggleSidebar}>
                        <i className="icon icon-24 icon-menu" />
                    </button>
                    {children}
                </div>
            </nav>
        );
    }
}
