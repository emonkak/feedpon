import React, { PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

export default class SettingsNavbar extends PureComponent<any, any> {
    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Settings</div>
            </Navbar>
        );
    }
}

