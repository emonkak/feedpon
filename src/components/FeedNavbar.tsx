import * as React from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import connect from 'utils/components/connect';

@connect((state: any) => ({ feed: state.feed }))
export default class FeedNavbar extends React.PureComponent<any, any> {
    static propTypes = {
        feed: React.PropTypes.object,
        onToggleSidebar: React.PropTypes.func,
    };

    render() {
        const { feed, onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <a className="navbar-title" href="#">{feed ? feed.title : 'Loading...'}</a>
                <a className="navbar-action" href="#">
                    <i className="icon icon-48 icon-size-24 icon-checkmark" />
                    <span className="badge badge-overlap badge-negative">2</span>
                </a>
                <a className="navbar-action" href="#">
                    <i className="icon icon-48 icon-size-24 icon-refresh" />
                </a>
                <Dropdown toggleButton={<a className="navbar-action" href="#"><i className="icon icon-48 icon-size-24 icon-more" /></a>} pullRight={true}>
                    <MenuItem icon={<i className="icon icon-16 icon-checkmark" />} primaryText="Action" secondaryText="Secondary Text" />
                    <MenuItem primaryText="Another action" secondaryText="Secondary Text" />
                    <MenuItem primaryText="Something else here" secondaryText="Secondary Text" />
                </Dropdown>
            </Navbar>
        );
    }
}
