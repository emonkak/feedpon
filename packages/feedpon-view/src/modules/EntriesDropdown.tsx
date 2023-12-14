import React, { PureComponent } from 'react';
import classnames from 'classnames';

import ConfirmModal from '../components/ConfirmModal';
import Dropdown from '../components/Dropdown';
import Portal from '../components/Portal';
import type { Entry } from 'feedpon-messaging';
import { MenuItem } from '../components/Menu';

interface EntriesDropdownProps {
    activeEntryIndex: number;
    canMarkStreamAsRead: boolean;
    entries: Entry[];
    keepUnread: boolean;
    onClearReadPosition: () => void;
    onMarkStreamAsRead: () => void;
    onScrollToEntry: (index: number) => void;
    onToggleUnreadKeeping: () => void;
    readEntryIndex: number;
    title: string;
}

interface EntriesDropdownState {
    isMarkingAllAsRead: boolean;
    behindExpanded: boolean;
    aheadExpanded: boolean;
}

interface Slice {
    start: number;
    end: number;
}

export default class EntriesDropdown extends PureComponent<EntriesDropdownProps, EntriesDropdownState> {
    constructor(props: EntriesDropdownProps) {
        super(props);

        this.state = {
            isMarkingAllAsRead: false,
            behindExpanded: false,
            aheadExpanded: false
        };
    }

    override render() {
        const {
            canMarkStreamAsRead,
            entries,
            keepUnread,
            onClearReadPosition,
            onMarkStreamAsRead,
            onScrollToEntry,
            onToggleUnreadKeeping,
            readEntryIndex,
            title
        } = this.props;
        const { isMarkingAllAsRead } = this.state;

        const slice = this._getCurrentSlice();
        const numCurrentReadEntries = entries.slice(0, readEntryIndex + 1)
            .reduce((total, entry) => total + (entry.markedAsRead ? 0 : 1), 0);

        return <>
            <Dropdown
                toggleButton={
                    <button className="navbar-action">
                        <i className="icon icon-24 icon-checkmark" />
                        <span className={classnames('badge badge-small badge-pill badge-overlap', keepUnread ? 'badge-default' : 'badge-negative')}>
                            {numCurrentReadEntries || ''}
                        </span>
                    </button>
                }
                onClose={this._handleClose}>
                <div className="menu-heading">Entries</div>
                {slice.start > 0 &&
                    <a className="menu-item" href="#" onClick={this._handleExpandBehind}>
                        <strong className="menu-item-primary-text u-text-muted">{slice.start} entries hidden</strong>
                    </a>}
                {this._renderEntryMenuItems(slice)}
                {slice.end < entries.length - 1 &&
                    <a className="menu-item" href="#" onClick={this._handleExpandAhead}>
                        <strong className="menu-item-primary-text u-text-muted">{entries.length - slice.end} entries hidden</strong>
                    </a>}
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={readEntryIndex < 0}
                    onSelect={onScrollToEntry}
                    primaryText="Scroll to read position"
                    value={readEntryIndex + 1} />
                <MenuItem
                    isDisabled={numCurrentReadEntries === 0}
                    onSelect={onClearReadPosition}
                    primaryText="Clear read position" />
                <div className="menu-divider" />
                <MenuItem
                    isDisabled={!canMarkStreamAsRead}
                    onSelect={this._handleOpenMarkAllAsReadModal}
                    primaryText="Mark all as read in stream..." />
                <div className="menu-divider" />
                <MenuItem
                    icon={keepUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                    onSelect={onToggleUnreadKeeping}
                    primaryText="Keep unread" />
            </Dropdown>
            <Portal>
                <ConfirmModal
                    isOpened={isMarkingAllAsRead}
                    onClose={this._handleCloseMarkAllAsReadModal}
                    message="Are you sure you want to mark as read in this stream?"
                    confirmButtonClassName="button button-positive"
                    confirmButtonLabel="Mark all as read"
                    onConfirm={onMarkStreamAsRead}
                    title={`Mark all as read in "${title}"`} />
            </Portal>
        </>;
    }

    private _getCurrentSlice(): Slice {
        const { activeEntryIndex, entries } = this.props;
        const { aheadExpanded, behindExpanded } = this.state;
        const { start, end } = getSliceAtPosition(0, entries.length, activeEntryIndex >= 0 ? activeEntryIndex : 0, 5);

        return {
            start: behindExpanded ? 0 : start,
            end: aheadExpanded ? entries.length : end
        };
    }

    private _renderEntryMenuItems(slice: Slice): React.ReactNode {
        const { activeEntryIndex, entries, onScrollToEntry, readEntryIndex } = this.props;

        const items = [];

        for (let i = slice.start, l = slice.end; i < l; i++) {
            const entry = entries[i]!;

            const icon = i === activeEntryIndex
                ? <i className="icon icon-16 icon-dot u-text-negative" />
                : entry.markedAsRead
                    ? <i className="icon icon-16 icon-dot u-text-muted" />
                    : i <= readEntryIndex
                        ? <i className="icon icon-16 icon-dot u-text-positive" />
                        : null;

            items.push(
                <MenuItem
                    icon={icon}
                    key={entry.entryId}
                    onSelect={onScrollToEntry}
                    primaryText={entry.title}
                    secondaryText={`${i + 1}`}
                    value={i} />
            );
        }

        return items;
    }

    private _handleClose = (): void => {
        this.setState({
            behindExpanded: false,
            aheadExpanded: false
        });
    }

    private _handleExpandBehind = (event: React.MouseEvent<any>): void => {
        event.preventDefault();

        this.setState({
            behindExpanded: true
        });
    }

    private _handleExpandAhead = (event: React.MouseEvent<any>): void => {
        event.preventDefault();

        this.setState({
            aheadExpanded: true
        });
    }

    private _handleOpenMarkAllAsReadModal = (): void => {
        this.setState({
            isMarkingAllAsRead: true
        });
    }

    private _handleCloseMarkAllAsReadModal = (): void => {
        this.setState({
            isMarkingAllAsRead: false
        });
    }
}

function getSliceAtPosition(start: number, end: number, position: number, size: number): Slice {
    const behindSpace = position - start;
    const aheadSpace = end - 1 - position;

    if (behindSpace < size) {
        return {
            start: position - behindSpace,
            end: Math.min(position + size + (size - behindSpace) + 1, end)
        };
    } else if (aheadSpace < size) {
        return {
            start: Math.max(position - size - (size - (aheadSpace)), start),
            end: position + aheadSpace + 1
        };
    } else {
        return {
            start: position - size,
            end: position + size + 1
        };
    }
}
