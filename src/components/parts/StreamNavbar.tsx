import React, { PureComponent } from 'react';

import Navbar from 'components/widgets/Navbar';
import EntriesDropdown from 'components/parts/EntriesDropdown';
import StreamFetchOptionsDropdown from 'components/parts/StreamFetchOptionsDropdown';
import { Entry, EntryOrderKind, Feed, StreamFetchOptions, StreamViewKind } from 'messaging/types';

interface StreamNavbarProps {
    canMarkAllAsRead: boolean;
    entries: Entry[];
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
    readEntryIndex: number;
    streamView: StreamViewKind;
    title: string;
}

export default class StreamNavbar extends PureComponent<StreamNavbarProps, {}> {
    render() {
        const {
            readEntryIndex,
            canMarkAllAsRead,
            entries,
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
                <EntriesDropdown
                    canMarkAllAsRead={canMarkAllAsRead}
                    entries={entries}
                    keepUnread={keepUnread}
                    onClearReadEntries={onClearReadEntries}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onScrollToEntry={onScrollToEntry}
                    onToggleUnreadKeeping={onToggleUnreadKeeping}
                    readEntryIndex={readEntryIndex}
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
