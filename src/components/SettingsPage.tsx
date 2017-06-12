import React, { PureComponent } from 'react';
import { History } from 'history';
import { Params } from 'react-router/lib/Router';

import KeyboardSettings from 'components/KeyboardSettings';
import MainLayout from 'components/layouts/MainLayout';
import Nav from 'components/parts/Nav';
import NavItem from 'components/parts/NavItem';
import Navbar from 'components/parts/Navbar';
import SharedSiteinfoSettings from 'components/SharedSiteinfoSettings';
import StreamSettings from 'components/StreamSettings';
import TrackingUrlSettings from 'components/TrackingUrlSettings';
import UserSiteinfoSettings from 'components/UserSiteinfoSettings';

interface SettingsProps {
    onToggleSidebar: () => void;
    params: Params;
    router: History;
}

export default class SettingsPage extends PureComponent<SettingsProps, {}> {
    constructor(props: SettingsProps, context: any) {
        super(props, context);

        this.handleSelectNavItem = this.handleSelectNavItem.bind(this);
    }

    handleSelectNavItem(value: string) {
        const { router } = this.props;

        router.replace('/settings/' + value);
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">Settings</h1>
            </Navbar>
        );
    }

    renderNavContent() {
        const { params } = this.props;

        switch (params['setting_id'] || 'general') {
            case 'general':
                return (
                    <div>
                        <StreamSettings />
                        <TrackingUrlSettings />
                    </div>
                );

            case 'keyboard':
                return (
                    <KeyboardSettings />
                );

            case 'siteinfo':
                return (
                    <section>
                        <h1 className="display-1">Siteinfo</h1>
                        <p>Siteinfo is used for extracting the full content.</p>
                        <UserSiteinfoSettings />
                        <SharedSiteinfoSettings />
                    </section>
                );

            default:
                return null;
        }
    }

    renderContent() {
        const { params } = this.props;
        const value = params['setting_id'] || 'general';

        return (
            <div className="container">
                <Nav
                    value={value}
                    onSelect={this.handleSelectNavItem}>
                    <NavItem value="general" title="General">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-settings" /><span className="u-sm-none u-md-inline">General</span>
                    </NavItem>
                    <NavItem value="keyboard" title="Keyboard">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-keyboard" /><span className="u-sm-none u-md-inline">Keyboard</span>
                    </NavItem>
                    <NavItem value="siteinfo" title="Siteinfo">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-database" /><span className="u-sm-none u-md-inline">Siteinfo</span>
                    </NavItem>
                </Nav>
                {this.renderNavContent()}
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
