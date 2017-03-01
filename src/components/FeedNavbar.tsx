import React, { PropTypes, PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import connect from 'utils/components/connect';
import { State, ViewType } from 'messaging/types';
import { changeViewType } from 'messaging/actions';

@connect((state: State) => ({
    feed: state.feed,
    viewType: state.viewType
}))
export default class FeedNavbar extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        feed: PropTypes.object,
        onToggleSidebar: PropTypes.func,
        viewType: PropTypes.string.isRequired
    };

    handleChangeViewType(viewType: ViewType) {
        const { dispatch } = this.props;

        dispatch(changeViewType(viewType));
    }

    render() {
        const { feed, viewType, onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title" href="#"><a className="link-default" href="#">{feed ? feed.title : 'Loading...'}</a></div>
                <a className="navbar-action" href="#">
                    <i className="icon icon-48 icon-size-24 icon-checkmark" />
                    <span className="badge badge-overlap badge-negative">2</span>
                </a>
                <a className="navbar-action" href="#">
                    <i className="icon icon-48 icon-size-24 icon-refresh" />
                </a>
                <Dropdown toggleButton={<a className="navbar-action" href="#"><i className="icon icon-48 icon-size-24 icon-more" /></a>} pullRight={true}>
                    <MenuItem
                        icon={viewType === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        primaryText="Expanded View"
                        onSelect={() => this.handleChangeViewType('expanded')} />
                    <MenuItem
                        icon={viewType === 'collapsable' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        primaryText="Collapsable View"
                        onSelect={() => this.handleChangeViewType('collapsable')} />
                    <div className="menu-divider" />
                    <MenuItem primaryText="Action" />
                    <MenuItem primaryText="Another action" />
                    <MenuItem primaryText="Something else here" />
                </Dropdown>
            </Navbar>
        );
    }
}
