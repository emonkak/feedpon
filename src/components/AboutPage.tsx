import React, { PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

interface AboutProps {
    onToggleSidebar: () => void;
}

export default class AboutPage extends PureComponent<AboutProps, {}> {
    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">About</h1>
            </Navbar>
        );
    }

    renderContent() {
        return (
            <div className="container">
                <h1>About</h1>
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
