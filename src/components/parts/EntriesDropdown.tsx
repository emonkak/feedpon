import React, { PureComponent } from 'react';
import classnames from 'classnames';

import ConfirmModal from 'components/widgets/ConfirmModal';
import Dropdown from 'components/widgets/Dropdown';
import Portal from 'components/widgets/Portal';
import { Entry } from 'messaging/types';
import { MenuItem } from 'components/widgets/Menu';

interface EntriesDropdownProps {
    canMarkAsRead: boolean;
    entries: Entry[];
    keepUnread: boolean;
    onClearReadEntries: () => void;
    onMarkAllAsRead: () => void;
    onScrollToEntry: (entryId: string) => void;
    onToggleUnreadKeeping: () => void;
    readEntryIndex: number;
    title: string;
}

interface EntriesDropdownState {
    isMarkingAllAsRead: boolean;
}

export default class EntriesDropdown extends PureComponent<EntriesDropdownProps, EntriesDropdownState> {
    constructor(props: EntriesDropdownProps, context: any) {
        super(props, context);

        this.state = { 
            isMarkingAllAsRead: false
        };

        this.handleOpenMarkAllAsReadModal = this.handleOpenMarkAllAsReadModal.bind(this);
        this.handleCloseMarkAllAsReadModal = this.handleCloseMarkAllAsReadModal.bind(this);
    }

    handleOpenMarkAllAsReadModal() {
        this.setState({
            isMarkingAllAsRead: true
        });
    }

    handleCloseMarkAllAsReadModal() {
        this.setState({
            isMarkingAllAsRead: false
        });
    }

    renderEntryMenuItem(entry: Entry, index: number) {
        const { onScrollToEntry, readEntryIndex } = this.props;
        const isRead = index <= readEntryIndex || entry.markedAsRead;

        return (
            <MenuItem
                icon={isRead && <i className="icon icon-16 icon-dot u-text-positive" />}
                key={entry.entryId}
                onSelect={onScrollToEntry}
                primaryText={entry.title}
                value={entry.entryId} />
        );
    }

    render() {
        const {
            canMarkAsRead,
            entries,
            keepUnread,
            onClearReadEntries,
            onMarkAllAsRead,
            onToggleUnreadKeeping,
            readEntryIndex,
            title
        } = this.props;
        const { isMarkingAllAsRead } = this.state;

        const numCurrentReadEntries = entries.slice(0, readEntryIndex + 1)
            .reduce((total, entry) => total + (entry.markedAsRead ? 0 : 1), 0);

        return (
            <Portal overlay={
                <ConfirmModal
                    isOpened={isMarkingAllAsRead}
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
                                {numCurrentReadEntries || ''}
                            </span>
                        </button>
                    }>
                    <div className="menu-heading">Entries</div>
                    {entries.map(this.renderEntryMenuItem, this)}
                    <div className="menu-divider" />
                    <MenuItem
                        icon={keepUnread ? <i className="icon icon-16 icon-checkmark" /> : null}
                        onSelect={onToggleUnreadKeeping}
                        primaryText="Keep unread" />
                    <div className="menu-divider" />
                    <MenuItem
                        isDisabled={numCurrentReadEntries === 0}
                        onSelect={onClearReadEntries}
                        primaryText="Clear read entries" />
                    <MenuItem
                        isDisabled={!canMarkAsRead}
                        onSelect={this.handleOpenMarkAllAsReadModal}
                        primaryText="Mark all as read in stream..." />
                </Dropdown>
            </Portal>
        );
    }
}
