import * as React from 'react';

export default class Navbar extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.node,
        onToggleSidebar: React.PropTypes.func,
    };

    handleToggleSidebar(event: React.MouseEvent<any>) {
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
                <a className="navbar-toggle-icon u-md-none" href="#" onClick={this.handleToggleSidebar.bind(this)}>
                    <i className="icon icon-48 icon-size-24 icon-menu" />
                </a>
                {children}
            </nav>
        );
    }
}
