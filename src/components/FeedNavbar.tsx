import React, { PropTypes, PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import connect from 'utils/components/connect';
import { State, ViewMode } from 'messaging/types';
import { changeViewMode } from 'messaging/actions';

@connect((state: State) => ({
    feed: state.feed,
    viewMode: state.viewMode
}))
export default class FeedNavbar extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        feed: PropTypes.object,
        onToggleSidebar: PropTypes.func,
        viewMode: PropTypes.string.isRequired
    };

    handleChangeViewMode(viewMode: ViewMode) {
        const { dispatch } = this.props;

        dispatch(changeViewMode(viewMode));
    }

    render() {
        const { feed, viewMode, onToggleSidebar } = this.props;

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
                    <MenuItem
                        icon={viewMode === 'full' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        primaryText="Full View"
                        onSelect={() => this.handleChangeViewMode('full')} />
                    <MenuItem
                        icon={viewMode === 'compact' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        primaryText="Compact View"
                        onSelect={() => this.handleChangeViewMode('compact')} />
                    <div className="menu-divider" />
                    <MenuItem primaryText="Action" />
                    <MenuItem primaryText="Another action" />
                    <MenuItem primaryText="Something else here" />
                </Dropdown>
            </Navbar>
        );
    }
}
