import React, { PropTypes, PureComponent } from 'react';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import RelativeTime from 'components/parts/RelativeTime';
import bindAction from 'utils/bindAction';
import connect from 'utils/react/connect';
import { Feed, FeedSpecification, FeedView, Siteinfo, State } from 'messaging/types';
import { changeFeedView, clearReadEntries, fetchFeed, updateSiteinfo } from 'messaging/actions';

const SCROLL_OFFSET = 48;

interface FeedNavbarProps {
    feed: Feed;
    onChangeFeedView: (view: FeedView) => void,
    onClearReadEntries: () => void,
    onFetchFeed: (feedId: string, specification?: FeedSpecification) => void;
    onToggleSidebar: () => void,
    onUpdateSiteinfo: () => void,
    scrollTo: (x: number, y: number) => Promise<void>;
    siteinfo: Siteinfo;
};

class FeedNavbar extends PureComponent<FeedNavbarProps, {}> {
    static propTypes = {
        feed: PropTypes.object,
        onChangeFeedView: PropTypes.func.isRequired,
        onClearReadEntries: PropTypes.func.isRequired,
        onFetchFeed: PropTypes.func.isRequired,
        onToggleSidebar: PropTypes.func.isRequired,
        onUpdateSiteinfo: PropTypes.func.isRequired,
        scrollTo: PropTypes.func.isRequired
    };

    handleChangeEntryOrder(order: 'newest' | 'oldest') {
        const { feed, onFetchFeed, scrollTo } = this.props;

        if (feed.feedId) {
            scrollTo(0, 0);

            onFetchFeed(feed.feedId, {
                ...feed.specification,
                order
            });
        }
    }

    handleToggleOnlyUnread() {
        const { feed, onFetchFeed } = this.props;

        if (feed.feedId) {
            scrollTo(0, 0);

            onFetchFeed(feed.feedId, {
                ...feed.specification,
                onlyUnread: !feed.specification.onlyUnread
            });
        }
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

    handleUpdateSiteinfo() {
        const { onUpdateSiteinfo } = this.props;

        onUpdateSiteinfo();
    }

    renderTitle() {
        const { feed } = this.props;

        if (feed.url) {
            return (
                <a className="link-default" href={feed.url} target="_blank">{feed.title}</a>
            );
        } else {
            return feed.title;
        }
    }

    renderReadEntriesDropdown() {
        const { feed } = this.props;

        const readEntries = feed.entries.filter(entry => !!entry.readAt);

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
                {readEntries.map((entry) => (
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
                    isDisabled={feed.entries.length === 0}
                    primaryText="Mark all as read" />
            </Dropdown>
        );
    }

    renderConfigDropdown() {
        const { feed, siteinfo, onChangeFeedView } = this.props;

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={<a href="#"><i className="icon icon-24 icon-more" /></a>}
                pullRight={true}>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={feed.view === 'expanded' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Expanded view"
                    onSelect={onChangeFeedView.bind(null, 'expanded')} />
                <MenuItem
                    icon={feed.view === 'collapsible' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeFeedView.bind(null, 'collapsible')} />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    icon={feed.specification.order === 'newest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Newest first"
                    onSelect={this.handleChangeEntryOrder.bind(this, 'newest')} />
                <MenuItem
                    icon={feed.specification.order === 'oldest' ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Oldest first"
                    onSelect={this.handleChangeEntryOrder.bind(this, 'oldest')} />
                <div className="menu-divider" />
                <MenuItem
                    icon={feed.specification.onlyUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    primaryText="Only unread"
                    onSelect={this.handleToggleOnlyUnread.bind(this)} />
                <div className="menu-divider" />
                <MenuItem
                    onSelect={this.handleUpdateSiteinfo.bind(this)}
                    primaryText="Update siteinfo..."
                    secondaryText={siteinfo.lastUpdatedAt ? <RelativeTime time={siteinfo.lastUpdatedAt} /> : 'Not updated yet'} />
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
                {this.renderReadEntriesDropdown()}
                {this.renderConfigDropdown()}
            </Navbar>
        );
    }
}

export default connect(
    (state: State) => ({
        feed: state.feed,
        siteinfo: state.siteinfo
    }),
    (dispatch) => ({
        onChangeFeedView: bindAction(changeFeedView, dispatch),
        onClearReadEntries: bindAction(clearReadEntries, dispatch),
        onFetchFeed: bindAction(fetchFeed, dispatch),
        onUpdateSiteinfo: bindAction(updateSiteinfo, dispatch)
    })
)(FeedNavbar);
