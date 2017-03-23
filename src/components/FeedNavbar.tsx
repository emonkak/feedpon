import Enumerable from '@emonkak/enumerable';
import React, { PropTypes, PureComponent } from 'react';

import '@emonkak/enumerable/extensions/orderBy';
import '@emonkak/enumerable/extensions/toArray';
import '@emonkak/enumerable/extensions/where';

import Dropdown from 'components/parts/Dropdown';
import MenuItem from 'components/parts/MenuItem';
import Navbar from 'components/parts/Navbar';
import RelativeTime from 'components/parts/RelativeTime';
import connect from 'utils/components/connect';
import { Entry, State, ViewMode } from 'messaging/types';
import { changeViewMode, clearReadEntries } from 'messaging/actions';

const SCROLL_OFFSET = 48;

@connect((state: State) => ({
    feed: state.feed,
    viewMode: state.preference.viewMode
}))
export default class FeedNavbar extends PureComponent<any, any> {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        feed: PropTypes.object,
        onToggleSidebar: PropTypes.func,
        scrollTo: PropTypes.func.isRequired,
        viewMode: PropTypes.oneOf(['expanded', 'collapsible']).isRequired
    };

    handleChangeViewType(viewMode: ViewMode) {
        this.props.dispatch(changeViewMode(viewMode));
    }

    handleMarkEntryAsRead(entryId: string) {
        const scrollElement = document.getElementById('entry-' + entryId);

        if (scrollElement) {
            this.props.scrollTo(0, scrollElement.offsetTop - SCROLL_OFFSET);
        }
    }

    handleClearReadEntries(entryId: string) {
        this.props.dispatch(clearReadEntries());
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

        if (!feed) {
            return null;
        }

        const readEntries = new Enumerable<Entry>(feed.entries)
            .where(entry => !!entry.readAt)
            .orderBy(entry => entry.readAt)
            .toArray();

        return (
            <Dropdown
                className="navbar-action"
                toggleButton={
                    <a href="#">
                        <i className="icon icon-48 icon-size-24 icon-checkmark" />
                        <span className="badge badge-overlap badge-negative">{readEntries.length || ''}</span>
                    </a>
                }
                pullRight={true}>
                <div className="menu-heading">Read entries</div>
                {readEntries.map(entry => (
                    <MenuItem 
                        onSelect={this.handleMarkEntryAsRead.bind(this, entry.entryId)}
                        key={entry.entryId}
                        primaryText={entry.title}
                        secondaryText={<RelativeTime time={entry.readAt} />} />
                ))}
                <div className="menu-divider" />
                <MenuItem
                    onSelect={this.handleClearReadEntries.bind(this)}
                    isDisabled={readEntries.length === 0}
                    primaryText="Clear all read entries" />
            </Dropdown>
        );
    }

    render() {
        const { onToggleSidebar, viewMode } = this.props;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <div className="navbar-title" href="#">{this.renderTitle()}</div>
                {this.renderReadEntryDropdown()}
                <Dropdown
                    className="navbar-action"
                    toggleButton={<a href="#"><i className="icon icon-48 icon-size-24 icon-more" /></a>}
                    pullRight={true}>
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
