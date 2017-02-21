import * as React from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import connect from 'utils/components/connect';
import { State } from 'messaging/types';

@connect((state: State) => ({
    title: state.pageTitle,
}))
export default class Navbar extends React.PureComponent<any, any> {
    static propTypes = {
        title: React.PropTypes.string,
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
        const { title } = this.props;

        return (
            <nav className="navbar">
                <a className="navbar-toggle-icon u-md-none" href="#" onClick={this.handleToggleSidebar.bind(this)}>
                    <i className="icon icon-24 icon-menu" />
                </a>
                <h1 className="navbar-title"><a className="link-default u-text-truncate" href="#">{title}</a></h1>
                <ul className="navbar-actions">
                    <li>
                        <a className="link-default icon-container" href="#">
                            <i className="icon icon-24 icon-checkmark" />
                            <span className="badge badge-overlap badge-negative">2</span>
                        </a>
                    </li>
                    <li>
                        <a className="link-default icon-container" href="#">
                            <i className="icon icon-24 icon-refresh" />
                        </a>
                    </li>
                    <li>
                        <Dropdown toggleButton={<a className="link-default" href="#"><i className="icon icon-24 icon-more" /></a>} pullRight={true}>
                            <MenuItem icon={<i className="icon icon-16 icon-checkmark" />} primaryText="Action" secondaryText="Secondary Text" />
                            <MenuItem primaryText="Another action" secondaryText="Secondary Text" />
                            <MenuItem primaryText="Something else here" secondaryText="Secondary Text" />
                        </Dropdown>
                    </li>
                </ul>
            </nav>
        );
    }
}
