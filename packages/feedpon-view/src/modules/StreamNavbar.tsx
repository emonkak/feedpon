import React from 'react';

import Navbar from '../components/Navbar';
import EntriesDropdown from './EntriesDropdown';
import StreamFetchOptionsDropdown from './StreamFetchOptionsDropdown';
import type { Entry, EntryOrderKind, Feed, StreamFetchOptions, StreamViewKind } from 'feedpon-messaging';

interface StreamNavbarProps {
    activeEntryIndex: number;
    canMarkStreamAsRead: boolean;
    entries: Entry[];
    feed: Feed | null;
    fetchOptions: StreamFetchOptions | null;
    isExpanded: boolean;
    isLoading: boolean;
    keepUnread: boolean;
    onChangeEntryOrderKind: (order: EntryOrderKind) => void;
    onChangeNumberOfEntries: (numEntries: number) => void;
    onChangeStreamView: (streamView: StreamViewKind) => void;
    onClearReadPosition: () => void;
    onCloseEntry: () => void;
    onMarkStreamAsRead: () => void;
    onReloadEntries: () => void;
    onScrollToEntry: (index: number) => void;
    onToggleOnlyUnread: () => void;
    onToggleSidebar: () => void;
    onToggleUnreadKeeping: () => void;
    readEntryIndex: number;
    streamView: StreamViewKind;
    title: string;
}

const StreamNavbar: React.FC<StreamNavbarProps> = ({
    activeEntryIndex,
    canMarkStreamAsRead,
    entries,
    fetchOptions,
    isExpanded,
    isLoading,
    keepUnread,
    onChangeEntryOrderKind,
    onChangeNumberOfEntries,
    onChangeStreamView,
    onClearReadPosition,
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
        <Navbar onToggleSidebar={onToggleSidebar} progress={entries.length > 0 ? activeEntryIndex / entries.length : 0}>
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
                activeEntryIndex={activeEntryIndex}
                canMarkStreamAsRead={canMarkStreamAsRead}
                entries={entries}
                keepUnread={keepUnread}
                onClearReadPosition={onClearReadPosition}
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
};

export default StreamNavbar;
