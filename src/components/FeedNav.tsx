import * as React from 'react';

import Dropdown from 'components/parts/Dropdown';
import DropdownMenuItem from 'components/parts/DropdownMenuItem';

export default class FeedNav extends React.PureComponent<any, any> {
    render() {
        return (
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
        );
    }
}
