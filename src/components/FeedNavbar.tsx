import React, { PropTypes, PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import bindAction from 'supports/bindAction';
import connect from 'supports/react/connect';
import { Feed, State, ViewMode } from 'messaging/types';
import { changeViewMode, clearReadEntries } from 'messaging/actions';

const SCROLL_OFFSET = 48;

interface FeedNavbarProps {
    feed: Feed | null;
    onChangeViewMode: (viewMode: ViewMode) => void,
    onClearReadEntries: () => void,
    onToggleSidebar: () => void,
    scrollTo: (x: number, y: number) => Promise<void>;
    viewMode: ViewMode;
};

class FeedNavbar extends PureComponent<FeedNavbarProps, {}> {
    static propTypes = {
        feed: PropTypes.object,
        onChangeViewMode: PropTypes.func.isRequired,
        onClearReadEntries: PropTypes.func.isRequired,
        onToggleSidebar: PropTypes.func,
        scrollTo: PropTypes.func.isRequired,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    handleChangeViewType(viewMode: ViewMode) {
        this.props.onChangeViewMode(viewMode);
    }

    handleMarkEntryAsRead(entryId: string) {
        const scrollElement = document.getElementById('entry--' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleClearReadEntries(entryId: string) {
        const { onClearReadEntries, scrollTo } = this.props;

        scrollTo(0, 0).then(() => onClearReadEntries());
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

    renderReadEntryDropdown() {
        const { feed } = this.props;

        const entries = feed ? feed.entries : [];
        const readEntries = entries.filter(entry => !!entry.readAt);

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={
                    <a href="#">
                        <i className="icon icon-24 icon-checkmark" />
                        <span className="badge badge-overlap badge-negative">{readEntries.length || ''}</span>
                    </a>
                }
                pullRight={true}>
                <div className="menu-heading">Read entries</div>
                {readEntries.map((entry, index) => (
                    <MenuItem 
                        onSelect={this.handleMarkEntryAsRead.bind(this, entry.entryId)}
                        key={entry.entryId}
                        primaryText={entry.title} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    onSelect={this.handleClearReadEntries.bind(this)}
                    isDisabled={readEntries.length === 0}
                    primaryText="Clear all read entries" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={entries.length === 0}
                    primaryText="Mark all as read" />
            </Dropdown>
        );
    }

    renderConfigDropdown() {
        const { viewMode } = this.props;

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={<a href="#"><i className="icon icon-24 icon-more" /></a>}
                pullRight={true}>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={viewMode === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Expanded View"
                    onSelect={() => this.handleChangeViewType('expanded')} />
                <MenuItem
                    icon={viewMode === 'collapsible' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Collapsible View"
                    onSelect={() => this.handleChangeViewType('collapsible')} />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem primaryText="Newest First" />
                <MenuItem primaryText="Oldest First" />
                <div className="menu-divider" />
                <MenuItem primaryText="Unread only" />
            </Dropdown>
        );
    }

    render() {
        const { onToggleSidebar } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title" href="#">{this.renderTitle()}</div>
                <div className="navbar-action">
                    <a href="#"><i className="icon icon-24 icon-refresh" /></a>
                </div>
                {this.renderReadEntryDropdown()}
                {this.renderConfigDropdown()}
            </Navbar>
        );
    }
}

export default connect(
    (state: State) => ({
        feed: state.feed,
        viewMode: state.preference.viewMode
    }),
    (dispatch) => ({
        onChangeViewMode: bindAction(changeViewMode, dispatch),
        onClearReadEntries: bindAction(clearReadEntries, dispatch)
    })
)(FeedNavbar);
