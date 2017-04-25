import React, { PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

interface AboutNavbarProps {
    onToggleSidebar: () => void;
}

export default class AboutNavbar extends PureComponent<AboutNavbarProps, {}> {
    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">About</div>
            </Navbar>
        );
    }
}
