import React, { PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

interface SettingsProps {
    onToggleSidebar: () => void;
}

export default class SettingsPage extends PureComponent<SettingsProps, {}> {
    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Settings</div>
            </Navbar>
        );
    }

    renderContent() {
        return (
            <div className="container">
                <h1>Settings</h1>
            </div>
        );
    }

    render() {
        return (
            <div className="l-main">
                <div className="l-main-header">
                    {this.renderNavbar()}
                </div>
                <div className="l-main-content">
                    {this.renderContent()}
                </div>
            </div>
        );
    }
}
