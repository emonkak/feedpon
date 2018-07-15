import React, { PureComponent } from 'react';
import { Location, History } from 'history';

import MainLayout from 'view/layouts/MainLayout';
import Navbar from 'view/components/Navbar';
import bindActions from 'utils/flux/bindActions';
import connect from 'utils/flux/react/connect';
import { Nav, NavItem } from 'view/components/Nav';
import { toggleSidebar } from 'messaging/ui/actions';

interface SettingsProps {
    children: React.ReactElement<any>;
    location: Location;
    onToggleSidebar: typeof toggleSidebar;
    router: History;
}

class SettingsPage extends PureComponent<SettingsProps> {
    constructor(props: SettingsProps) {
        super(props);

        this.handleSelectNavItem = this.handleSelectNavItem.bind(this);
    }

    handleSelectNavItem(path: string) {
        const { router } = this.props;

        router.replace(path);
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">Settings</h1>
            </Navbar>
        );
    }

    renderContent() {
        const { children, location } = this.props;

        return (
            <div className="container">
                <Nav onSelect={this.handleSelectNavItem}>
                    <NavItem
                        value="/settings/ui"
                        title="UI"
                        isSelected={location.pathname === '/settings/ui'}>
                        <i className="u-inline-block u-md-none icon icon-20 icon-browser-window" /><span className="u-none u-md-inline">UI</span>
                    </NavItem>
                    <NavItem
                        value="/settings/stream"
                        title="Stream"
                        isSelected={location.pathname === '/settings/stream'}>
                        <i className="u-inline-block u-md-none icon icon-20 icon-news-feed" /><span className="u-none u-md-inline">Stream</span>
                    </NavItem>
                    <NavItem
                        value="/settings/tracking_url"
                        title="Tracking URL"
                        isSelected={location.pathname === '/settings/tracking_url'}>
                        <i className="u-inline-block u-md-none icon icon-20 icon-link" /><span className="u-none u-md-inline">Tracking URL</span>
                    </NavItem>
                    <NavItem
                        value="/settings/url_replacement"
                        title="URL Replacement"
                        isSelected={location.pathname === '/settings/url_replacement'}>
                        <i className="u-inline-block u-md-none icon icon-20 icon-replace" /><span className="u-none u-md-inline">URL Replacement</span>
                    </NavItem>
                    <NavItem
                        value="/settings/siteinfo"
                        title="Siteinfo"
                        isSelected={location.pathname === '/settings/siteinfo'}>
                        <i className="u-inline-block u-md-none icon icon-20 icon-database" /><span className="u-none u-md-inline">Siteinfo</span>
                    </NavItem>
                    <NavItem
                        value="/settings/keyboard"
                        title="Keyboard"
                        isSelected={location.pathname === '/settings/keyboard'}>
                        <i className="u-inline-block u-md-none icon icon-20 icon-keyboard" /><span className="u-none u-md-inline">Keyboard</span>
                    </NavItem>
                </Nav>
                {children}
            </div>
        );
    }

    render() {
        return (
            <MainLayout header={this.renderNavbar()}>
                {this.renderContent()}
            </MainLayout>
        );
    }
}

export default connect({
    mapDispatchToProps: bindActions({
        onToggleSidebar: toggleSidebar
    })
})(SettingsPage);
