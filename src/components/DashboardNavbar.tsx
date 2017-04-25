import React, { PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

export default class DashboardNavbar extends PureComponent<any, any> {
    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Dashboard</div>
            </Navbar>
        );
    }
}


