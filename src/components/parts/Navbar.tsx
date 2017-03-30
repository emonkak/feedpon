import React, { PropTypes, PureComponent } from 'react';

interface Props {
    children?: React.ReactNode;
    onToggleSidebar?: () => void;
}

export default class Navbar extends PureComponent<Props, {}> {
    static propTypes = {
        children: PropTypes.node,
        onToggleSidebar: PropTypes.func,
    };

    handleToggleSidebar(event: React.SyntheticEvent<any>) {
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
                    <a className="navbar-toggle-icon u-md-none" href="#" onClick={this.handleToggleSidebar.bind(this)}>
                        <i className="icon icon-24 icon-menu" />
                    </a>
                    {children}
                </div>
            </nav>
        );
    }
}
