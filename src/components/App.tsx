import * as React from 'react';

import AutoHidingHeader from 'components/parts/AutoHidingHeader';
import Dropdown from 'components/parts/Dropdown';
import DropdownMenuItem from 'components/parts/DropdownMenuItem';
import Sidebar from 'components/Sidebar';

export default class App extends React.PureComponent<any, any> {
    static propTypes = {
        children: React.PropTypes.element.isRequired,
    };

    render() {
        const { children, location } = this.props;

        return (
            <div>
                <div className="l-sidebar">
                    <Sidebar activeKey={location.pathname} />
                </div>
                <AutoHidingHeader>
                    <div className="l-navbar">
                        <nav className="navbar">
                            <h1 className="navbar-title u-text-truncate"><a className="link-default" href="#">Typographica</a></h1>
                            <ul className="list-inline list-inline-slash">
                                <li><a href="#">Refresh</a></li>
                                <li><a href="#">Mark as Read</a></li>
                                <li>
                                    <Dropdown toggleButton={<a className="dropdown-toggle" href="#">View</a>} pullRight={true}>
                                        <DropdownMenuItem>Action</DropdownMenuItem>
                                        <DropdownMenuItem>Another action</DropdownMenuItem>
                                        <DropdownMenuItem>Something else here</DropdownMenuItem>
                                    </Dropdown>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </AutoHidingHeader>
                <div className="l-main">
                    {children}
                </div>
            </div>
        );
    }
}
