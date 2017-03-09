import React, { PropTypes, PureComponent } from 'react';

export default class Navbar extends PureComponent<any, any> {
    static propTypes = {
        children: PropTypes.node,
        onToggleSidebar: PropTypes.func,
    };

    handleToggleSidebar(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { onToggleSidebar } = this.props;

        if (onToggleSidebar) {
            onToggleSidebar(event);
        }
    }

    render() {
        const { children } = this.props;

        return (
            <nav className="navbar">
                <div className="navbar-container">
                    <a className="navbar-toggle-icon u-md-none" href="#" onClick={this.handleToggleSidebar.bind(this)}>
                        <i className="icon icon-48 icon-size-24 icon-menu" />
                    </a>
                    {children}
                </div>
            </nav>
        );
    }
}
