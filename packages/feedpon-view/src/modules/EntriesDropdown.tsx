import React, { useState, useMemo } from 'react';
import classnames from 'classnames';

import ConfirmModal from '../components/ConfirmModal';
import Dropdown from '../components/Dropdown';
import Portal from '../components/Portal';
import type { Entry } from 'feedpon-messaging';
import useEvent from '../hooks/useEvent';
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

interface Slice {
  start: number;
  end: number;
}

type Action =
  | { type: 'CHANGE_KEEP_UNREAD'; enabled: boolean }
  | { type: 'CLEAR_READ_POSITION' }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'SCROLL_TO_ENTRY'; index: number };

export default function EntriesDropdown({
  activeEntryIndex,
  canMarkStreamAsRead,
  onClearReadPosition,
  onScrollToEntry,
  onToggleUnreadKeeping,
  entries,
  keepUnread,
  onMarkStreamAsRead,
  readEntryIndex,
  title,
}: EntriesDropdownProps) {
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [behindExpanded, setBehindExpanded] = useState(false);
  const [aheadExpanded, setAheadExpanded] = useState(false);

  const slice = useMemo(() => {
    const { start, end } = getSliceAtPosition(
      0,
      entries.length,
      activeEntryIndex >= 0 ? activeEntryIndex : 0,
      5,
    );

    return {
      start: behindExpanded ? 0 : start,
      end: aheadExpanded ? entries.length : end,
    };
  }, [activeEntryIndex, entries, aheadExpanded, behindExpanded]);

  const numCurrentReadEntries = entries
    .slice(0, readEntryIndex + 1)
    .reduce((total, entry) => total + (entry.markedAsRead ? 0 : 1), 0);

  const handleClose = useEvent(() => {
    setAheadExpanded(false);
    setBehindExpanded(false);
  });

  const handleExpandBehind = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();

    setBehindExpanded(true);
  });

  const handleExpandAhead = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();

    setAheadExpanded(true);
  });

  const handleCloseMarkAllAsReadModal = useEvent(() => {
    setIsMarkingAllAsRead(false);
  });

  const handleSelectAction = useEvent((action: Action) => {
    switch (action.type) {
      case 'CLEAR_READ_POSITION':
        onClearReadPosition();
        break;
      case 'CHANGE_KEEP_UNREAD':
        onToggleUnreadKeeping();
        break;
      case 'MARK_ALL_AS_READ':
        setIsMarkingAllAsRead(true);
        break;
      case 'SCROLL_TO_ENTRY': {
        onScrollToEntry(action.index);
        break;
      }
    }
  });

  const menuItems = entries.slice(slice.start, slice.end).map((entry, i) => {
    const icon =
      i === activeEntryIndex ? (
        <i className="icon icon-16 icon-dot u-text-negative" />
      ) : entry.markedAsRead ? (
        <i className="icon icon-16 icon-dot u-text-muted" />
      ) : i <= readEntryIndex ? (
        <i className="icon icon-16 icon-dot u-text-positive" />
      ) : null;

    const index = i + slice.start;

    return (
      <MenuItem<Action>
        value={{ type: 'SCROLL_TO_ENTRY', index }}
        icon={icon}
        key={entry.entryId}
        primaryText={entry.title}
        secondaryText={`${index + 1}`}
      />
    );
  });

  return (
    <>
      <Dropdown
        onSelect={handleSelectAction}
        toggleButton={
          <button className="navbar-action">
            <i className="icon icon-24 icon-checkmark" />
            <span
              className={classnames(
                'badge badge-small badge-pill badge-overlap',
                keepUnread ? 'badge-default' : 'badge-negative',
              )}
            >
              {numCurrentReadEntries || ''}
            </span>
          </button>
        }
        onClose={handleClose}
      >
        <div className="menu-heading">Entries</div>
        {slice.start > 0 && (
          <a className="menu-item" href="#" onClick={handleExpandBehind}>
            <strong className="menu-item-primary-text u-text-muted">
              {slice.start} entries hidden
            </strong>
          </a>
        )}
        {menuItems}
        {slice.end < entries.length - 1 && (
          <a className="menu-item" href="#" onClick={handleExpandAhead}>
            <strong className="menu-item-primary-text u-text-muted">
              {entries.length - slice.end} entries hidden
            </strong>
          </a>
        )}
        <div className="menu-divider" />
        <MenuItem<Action>
          value={{
            type: 'SCROLL_TO_ENTRY',
            index: readEntryIndex + 1,
          }}
          isDisabled={readEntryIndex < 0}
          primaryText="Scroll to read position"
        />
        <MenuItem<Action>
          value={{ type: 'CLEAR_READ_POSITION' }}
          isDisabled={numCurrentReadEntries === 0}
          primaryText="Clear read position"
        />
        <div className="menu-divider" />
        <MenuItem<Action>
          value={{ type: 'MARK_ALL_AS_READ' }}
          isDisabled={!canMarkStreamAsRead}
          primaryText="Mark all as read in stream..."
        />
        <div className="menu-divider" />
        <MenuItem<Action>
          value={{
            type: 'CHANGE_KEEP_UNREAD',
            enabled: !keepUnread,
          }}
          icon={
            keepUnread ? <i className="icon icon-16 icon-checkmark" /> : null
          }
          primaryText="Keep unread"
        />
      </Dropdown>
      <Portal>
        <ConfirmModal
          confirmButtonClassName="button button-positive"
          confirmButtonLabel="Mark all as read"
          isOpened={isMarkingAllAsRead}
          message="Are you sure you want to mark as read in this stream?"
          onClose={handleCloseMarkAllAsReadModal}
          onConfirm={onMarkStreamAsRead}
          title={`Mark all as read in "${title}"`}
        />
      </Portal>
    </>
  );
}

function getSliceAtPosition(
  start: number,
  end: number,
  position: number,
  size: number,
): Slice {
  const behindSpace = position - start;
  const aheadSpace = end - 1 - position;

  if (behindSpace < size) {
    return {
      start: position - behindSpace,
      end: Math.min(position + size + (size - behindSpace) + 1, end),
    };
  } else if (aheadSpace < size) {
    return {
      start: Math.max(position - size - (size - aheadSpace), start),
      end: position + aheadSpace + 1,
    };
  } else {
    return {
      start: position - size,
      end: position + size + 1,
    };
  }
}
