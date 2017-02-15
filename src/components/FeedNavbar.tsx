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
                <a className="navbar-toggle-icon u-md-none" href="#" onClick={this.handleToggleSidebar.bind(this)}>
                    <i className="icon icon-24 icon-menu" />
                </a>
                <h1 className="navbar-title"><a className="link-default u-text-truncate" href="#">Navigation Bar Title Here</a></h1>
                <ul className="navbar-actions">
                    <li>
                        <a className="link-default icon-container" href="#">
                            <i className="icon icon-24 icon-checkmark" />
                            <span className="badge badge-overlap badge-negative">8</span>
                        </a>
                    </li>
                    <li>
                        <a className="link-default icon-container" href="#">
                            <i className="icon icon-24 icon-refresh" />
                        </a>
                    </li>
                    <li>
                        <Dropdown toggleButton={<a className="link-default" href="#"><i className="icon icon-24 icon-more" /></a>} pullRight={true}>
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
