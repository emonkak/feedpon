import * as React from 'react';

import Navbar from 'components/parts/Navbar';

export default class DashboardNavbar extends React.PureComponent<any, any> {
    static propTypes = {
        onToggleSidebar: React.PropTypes.func,
    };

    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Dashboard</div>
            </Navbar>
        );
    }
}


