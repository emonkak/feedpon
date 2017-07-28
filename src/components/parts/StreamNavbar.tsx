import React from 'react';

import Navbar from 'components/widgets/Navbar';
import EntriesDropdown from 'components/parts/EntriesDropdown';
import StreamFetchOptionsDropdown from 'components/parts/StreamFetchOptionsDropdown';
import { Entry, EntryOrderKind, Feed, StreamFetchOptions, StreamViewKind } from 'messaging/types';

interface StreamNavbarProps {
    canMarkStreamAsRead: boolean;
    entries: Entry[];
    feed: Feed | null;
    fetchOptions: StreamFetchOptions | null;
    isExpanded: boolean;
    isLoading: boolean;
    keepUnread: boolean;
    onChangeEntryOrderKind: (order: EntryOrderKind) => void,
    onChangeNumberOfEntries: (numEntries: number) => void,
    onChangeStreamView: (streamView: StreamViewKind) => void,
    onClearReadEntries: () => void;
    onCloseEntry: () => void;
    onMarkStreamAsRead: () => void;
    onReloadEntries: () => void;
    onScrollToEntry: (entryId: string | number) => void;
    onToggleOnlyUnread: () => void;
    onToggleSidebar: () => void;
    onToggleUnreadKeeping: () => void;
    readEntryIndex: number;
    streamView: StreamViewKind;
    title: string;
}

const StreamNavbar: React.SFC<StreamNavbarProps> = ({
    canMarkStreamAsRead,
    entries,
    feed,
    fetchOptions,
    isExpanded,
    isLoading,
    keepUnread,
    onChangeEntryOrderKind,
    onChangeNumberOfEntries,
    onChangeStreamView,
    onClearReadEntries,
    onCloseEntry,
    onMarkStreamAsRead,
    onReloadEntries,
    onScrollToEntry,
    onToggleOnlyUnread,
    onToggleSidebar,
    onToggleUnreadKeeping,
    readEntryIndex,
    streamView,
    title
}) => {
    return (
        <Navbar onToggleSidebar={onToggleSidebar}>
            <h1 className="navbar-title">
                <span className="stream-title u-text-truncate">{title}</span>
            </h1>
            <button
                disabled={isLoading}
                className="navbar-action"
                onClick={onReloadEntries}>
                <i className="icon icon-24 icon-refresh" />
            </button>
            <EntriesDropdown
                canMarkStreamAsRead={canMarkStreamAsRead}
                entries={entries}
                keepUnread={keepUnread}
                onClearReadEntries={onClearReadEntries}
                onMarkStreamAsRead={onMarkStreamAsRead}
                onScrollToEntry={onScrollToEntry}
                onToggleUnreadKeeping={onToggleUnreadKeeping}
                readEntryIndex={readEntryIndex}
                title={title} />
            {isExpanded &&
                <button className="navbar-action" onClick={onCloseEntry}>
                    <i className="icon icon-24 icon-close" />
                </button>}
            {!isExpanded && fetchOptions &&
                <StreamFetchOptionsDropdown
                    fetchOptions={fetchOptions}
                    isLoading={isLoading}
                    onChangeEntryOrderKind={onChangeEntryOrderKind}
                    onChangeNumberOfEntries={onChangeNumberOfEntries}
                    onChangeStreamView={onChangeStreamView}
                    onToggleOnlyUnread={onToggleOnlyUnread}
                    streamView={streamView} />}
        </Navbar>
    );
}

export default StreamNavbar;
