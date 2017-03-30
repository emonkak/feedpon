import React, { PropTypes, PureComponent } from 'react';

import Navbar from 'components/parts/Navbar';

interface Props {
    onToggleSidebar: () => void;
}

export default class AboutNavbar extends PureComponent<Props, {}> {
    static propTypes = {
        onToggleSidebar: PropTypes.func.isRequired,
    };

    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title">About</div>
            </Navbar>
        );
    }
}
