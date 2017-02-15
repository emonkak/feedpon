import * as React from 'react';

import Dropdown from 'components/parts/Dropdown';
import DropdownMenuItem from 'components/parts/DropdownMenuItem';

export default class FeedNav extends React.PureComponent<any, any> {
    static propTypes = {
        onToggleSidebar: React.PropTypes.func,
    };

    handleToggleSidebar(event: React.MouseEvent<any>) {
        event.preventDefault();

        const { onToggleSidebar } = this.props;

        if (onToggleSidebar) {
            onToggleSidebar(event);
        }
    }

    render() {
        return (
            <nav className="navbar">
                <a className="navbar-icon u-md-none" href="#" onClick={this.handleToggleSidebar.bind(this)}>
                    <i className="icon icon-24 icon-menu" />
                </a>
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
