import React, { PropTypes, PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import connect from 'utils/components/connect';
import { State, ViewType } from 'messaging/types';
import { changeViewType } from 'messaging/actions';

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

    handleChangeViewType(viewMode: ViewType) {
        const { dispatch } = this.props;

        dispatch(changeViewType(viewMode));
    }

    renderTitle() {
        const { feed } = this.props;

        if (feed) {
            return (
                <a className="link-default" href="#">{feed.title}</a>
            );
        } else {
            return (
                <span>Loading...</span>
            );
        }
    }

    render() {
        const { viewMode, onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title" href="#">{this.renderTitle()}</div>
                <a className="navbar-action" href="javascript:void()">
                    <i className="icon icon-48 icon-size-24 icon-checkmark" />
                    <span className="badge badge-overlap badge-negative">2</span>
                </a>
                <a className="navbar-action" href="javascript:void()">
                    <i className="icon icon-48 icon-size-24 icon-refresh" />
                </a>
                <Dropdown toggleButton={<a className="navbar-action" href="#"><i className="icon icon-48 icon-size-24 icon-more" /></a>} pullRight={true}>
                    <MenuItem
                        icon={viewMode === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        primaryText="Expanded View"
                        onSelect={() => this.handleChangeViewType('expanded')} />
                    <MenuItem
                        icon={viewMode === 'collapsible' ? <i className="icon icon-16 icon-checkmark" /> : null}
                        primaryText="Collapsable View"
                        onSelect={() => this.handleChangeViewType('collapsible')} />
                    <div className="menu-divider" />
                    <MenuItem primaryText="Action" />
                    <MenuItem primaryText="Another action" />
                    <MenuItem primaryText="Something else here" />
                </Dropdown>
            </Navbar>
        );
    }
}
