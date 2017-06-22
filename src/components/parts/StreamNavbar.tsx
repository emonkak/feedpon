import React, { PureComponent } from 'react';
import classnames from 'classnames';

import ConfirmModal from 'components/parts/ConfirmModal';
import Dropdown from 'components/parts/Dropdown';
import Navbar from 'components/parts/Navbar';
import Portal from 'components/parts/Portal';
import { Entry, EntryOrderKind, Feed, StreamFetchOptions, StreamViewKind } from 'messaging/types';
import { MenuItem } from 'components/parts/Menu';

interface StreamNavbarProps {
    canMarkAllAsRead: boolean;
    feed: Feed | null;
    fetchOptions: StreamFetchOptions;
    isLoading: boolean;
    keepUnread: boolean;
    onChangeEntryOrderKind: (order: EntryOrderKind) => void,
    onChangeStreamView: (streamView: StreamViewKind) => void,
    onClearReadEntries: () => void;
    onMarkAllAsRead: () => void;
    onReloadEntries: () => void;
    onScrollToEntry: (entryId: string | number) => void;
    onToggleOnlyUnread: () => void;
    onToggleSidebar: () => void;
    onToggleUnreadKeeping: () => void;
    readEntries: Entry[];
    streamView: StreamViewKind;
    title: string;
}

export default class StreamNavbar extends PureComponent<StreamNavbarProps, {}> {
    render() {
        const {
            canMarkAllAsRead,
            feed,
            fetchOptions,
            isLoading,
            keepUnread,
            onChangeEntryOrderKind,
            onChangeStreamView,
            onClearReadEntries,
            onMarkAllAsRead,
            onReloadEntries,
            onScrollToEntry,
            onToggleOnlyUnread,
            onToggleSidebar,
            onToggleUnreadKeeping,
            readEntries,
            streamView,
            title
        } = this.props;

        const titleElement = feed && feed.url
            ? <a className="stream-title u-text-truncate" href={feed.url} target="_blank">{title}</a>
            : <span className="stream-title u-text-truncate">{title}</span>;

        return (
            <Navbar onToggleSidebar={onToggleSidebar}>
                <h1 className="navbar-title">
                    {titleElement}
                </h1>
                <button
                    disabled={isLoading}
                    className="navbar-action"
                    onClick={onReloadEntries}>
                    <i className="icon icon-24 icon-refresh" />
                </button>
                <ReadEntriesDropdown
                    canMarkAllAsRead={canMarkAllAsRead}
                    keepUnread={keepUnread}
                    onClearReadEntries={onClearReadEntries}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onScrollToEntry={onScrollToEntry}
                    onToggleUnreadKeeping={onToggleUnreadKeeping}
                    readEntries={readEntries}
                    title={title} />
                <StreamFetchOptionsDropdown
                    fetchOptions={fetchOptions}
                    isLoading={isLoading}
                    onChangeEntryOrderKind={onChangeEntryOrderKind}
                    onChangeStreamView={onChangeStreamView}
                    onToggleOnlyUnread={onToggleOnlyUnread}
                    streamView={streamView} />
            </Navbar>
        );
    }
}

interface ReadEntriesDropdownProps {
    canMarkAllAsRead: boolean;
    keepUnread: boolean;
    onClearReadEntries: () => void;
    onMarkAllAsRead: () => void;
    onScrollToEntry: (entryId: string) => void;
    onToggleUnreadKeeping: () => void;
    readEntries: Entry[];
    title: string;
}

interface ReadEntriesDropdownState {
    markAllAsReadModalIsOpened: boolean;
}

class ReadEntriesDropdown extends PureComponent<ReadEntriesDropdownProps, ReadEntriesDropdownState> {
    constructor(props: ReadEntriesDropdownProps, context: any) {
        super(props, context);

        this.state = { 
            markAllAsReadModalIsOpened: false
        };

        this.handleOpenMarkAllAsReadModal = this.handleOpenMarkAllAsReadModal.bind(this);
        this.handleCloseMarkAllAsReadModal = this.handleCloseMarkAllAsReadModal.bind(this);
    }

    handleOpenMarkAllAsReadModal() {
        this.setState({
            markAllAsReadModalIsOpened: true
        });
    }

    handleCloseMarkAllAsReadModal() {
        this.setState({
            markAllAsReadModalIsOpened: false
        });
    }

    render() {
        const {
            canMarkAllAsRead,
            keepUnread,
            onClearReadEntries,
            onMarkAllAsRead,
            onScrollToEntry,
            onToggleUnreadKeeping,
            readEntries,
            title
        } = this.props;
        const { markAllAsReadModalIsOpened } = this.state;

        return (
            <Portal overlay={
                <ConfirmModal
                    isOpened={markAllAsReadModalIsOpened}
                    onClose={this.handleCloseMarkAllAsReadModal}
                    message="Are you sure you want to mark as read in this stream?"
                    confirmButtonClassName="button button-positive"
                    confirmButtonLabel="Mark all as read"
                    onConfirm={onMarkAllAsRead}
                    title={`Mark all as read in "${title}"`} />
            }>
                <Dropdown
                    toggleButton={
                        <button className="navbar-action">
                            <i className="icon icon-24 icon-checkmark" />
                            <span className={classnames('badge badge-small badge-pill badge-overlap', keepUnread ? 'badge-default' : 'badge-negative')}>
                                {readEntries.length || ''}
                            </span>
                        </button>
                    }>
                    <div className="menu-heading">Read entries</div>
                    {readEntries.map((entry) => (
                        <MenuItem
                            key={entry.entryId}
                            onSelect={onScrollToEntry}
                            primaryText={entry.title}
                            value={entry.entryId} />
                    ))}
                    <div className="menu-divider" />
                    <MenuItem
                        icon={keepUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                        onSelect={onToggleUnreadKeeping}
                        primaryText="Keep unread" />
                    <div className="menu-divider" />
                    <MenuItem
                        isDisabled={readEntries.length === 0}
                        onSelect={onClearReadEntries}
                        primaryText="Clear read entries" />
                    <MenuItem
                        isDisabled={!canMarkAllAsRead}
                        onSelect={this.handleOpenMarkAllAsReadModal}
                        primaryText="Mark all as read in stream..." />
                </Dropdown>
            </Portal>
        );
    }
}

interface StreamFetchOptionsDropdownProps {
    fetchOptions: StreamFetchOptions;
    isLoading: boolean;
    onChangeEntryOrderKind: (order: EntryOrderKind) => void;
    onChangeStreamView: (streamView: StreamViewKind) => void;
    onClose?: () => void;
    onKeyDown?: (event: React.KeyboardEvent<any>) => void;
    onSelect?: (value?: any) => void;
    onToggleOnlyUnread: () => void;
    streamView: StreamViewKind;
}

class StreamFetchOptionsDropdown extends PureComponent<StreamFetchOptionsDropdownProps, {}> {
    render() {
        const {
            fetchOptions,
            isLoading,
            onChangeEntryOrderKind,
            onChangeStreamView,
            onToggleOnlyUnread,
            streamView
        } = this.props;

        const checkmarkIcon = <i className="icon icon-16 icon-checkmark" />;

        return (
            <Dropdown
                toggleButton={
                    <button className="navbar-action">
                        <i className="icon icon-24 icon-menu-2" />
                    </button>
                }>
                <div className="menu-heading">View</div>
                <MenuItem
                    icon={streamView === 'expanded' ? checkmarkIcon : null}
                    onSelect={onChangeStreamView}
                    primaryText="Expanded view"
                    value="expanded" />
                <MenuItem
                    icon={streamView === 'collapsible' ? checkmarkIcon : null}
                    primaryText="Collapsible view"
                    onSelect={onChangeStreamView}
                    value="collapsible" />
                <div className="menu-divider" />
                <div className="menu-heading">Order</div>
                <MenuItem
                    isDisabled={isLoading}
                    icon={fetchOptions.entryOrder === 'newest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrderKind}
                    primaryText="Newest first"
                    value="newest" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={fetchOptions.entryOrder === 'oldest' ? checkmarkIcon : null}
                    onSelect={onChangeEntryOrderKind}
                    primaryText="Oldest first"
                    value="oldest" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={isLoading}
                    icon={fetchOptions.onlyUnread ? checkmarkIcon : null}
                    primaryText="Only unread"
                    onSelect={onToggleOnlyUnread} />
            </Dropdown>
        );
    }
}
