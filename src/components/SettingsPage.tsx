import React, { PureComponent } from 'react';
import { History } from 'history';
import { Params } from 'react-router/lib/Router';

import GeneralSettings from 'components/GeneralSettings';
import KeyboardSettings from 'components/KeyboardSettings';
import Nav from 'components/parts/Nav';
import NavItem from 'components/parts/NavItem';
import Navbar from 'components/parts/Navbar';
import SiteinfoSettings from 'components/SiteinfoSettings';
import SubscriptionSettings from 'components/SubscriptionSettings';

interface SettingsProps {
    onToggleSidebar: () => void;
    params: Params;
    router: History;
}

function renderNavContent(value: string) {
    switch (value) {
        case 'general':
            return <GeneralSettings />;

        case 'keyboard':
            return <KeyboardSettings />;

        case 'subscription':
            return <SubscriptionSettings />;

        case 'siteinfo':
            return <SiteinfoSettings />;

        default:
            return '';
    }
}

export default class SettingsPage extends PureComponent<SettingsProps, {}> {
    constructor(props: SettingsProps, context: any) {
        super(props, context);

        this.handleSelect = this.handleSelect.bind(this);
    }

    handleSelect(value: string) {
        const { router } = this.props;

        router.replace('/settings/' + value);
    }

    renderNavbar() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Settings</div>
            </Navbar>
        );
    }

    renderContent() {
        const { params } = this.props;
        const initialValue = params['setting_id'] || 'general';

        return (
            <div className="container">
                <Nav
                    initialValue={initialValue}
                    onSelect={this.handleSelect}
                    renderContent={renderNavContent}>
                    <NavItem value="general" title="General">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-settings" /><span className="u-sm-none u-md-inline">General</span>
                    </NavItem>
                    <NavItem value="keyboard" title="Keyboard">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-keyboard" /><span className="u-sm-none u-md-inline">Keyboard</span>
                    </NavItem>
                    <NavItem value="subscription" title="Subscription">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-folder" /><span className="u-sm-none u-md-inline">Subscription</span>
                    </NavItem>
                    <NavItem value="siteinfo" title="Siteinfo">
                        <i className="u-sm-inline-block u-md-none icon icon-20 icon-database" /><span className="u-sm-none u-md-inline">Siteinfo</span>
                    </NavItem>
                </Nav>
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
