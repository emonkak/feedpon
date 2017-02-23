import React, { PropTypes, PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

export default class SettingsNavbar extends PureComponent<any, any> {
    static propTypes = {
        onToggleSidebar: PropTypes.func,
    };

    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">Settings</div>
            </Navbar>
        );
    }
}

