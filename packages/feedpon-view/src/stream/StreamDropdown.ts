import { createComponent, type RenderContext } from 'barebind';
import type { Session, Stream } from 'feedpon-store';

import { openAlertDialog } from '../primitives/AlertDialog.ts';
import { Dropdown } from '../primitives/Dropdown.ts';
import type { MenuItem } from '../primitives/Menu.ts';

export interface StreamDropdownProps {
  isStreamUpdating: boolean;
  onEntrySelect: (index: number) => void;
  onStreamMarkAsRead: () => void;
  session: Session;
  stream: Stream;
}

interface Range {
  start: number;
  end: number;
}

export const StreamDropdown = createComponent(function StreamDropdown(
  {
    isStreamUpdating,
    onEntrySelect,
    onStreamMarkAsRead,
    session,
    stream,
  }: StreamDropdownProps,
  $: RenderContext,
): unknown {
  const [dropdownState, setDropdownState] = $.useState({
    aheadExpanded: false,
    behindExpanded: false,
  });

  const range = $.useMemo(() => {
    const { start, end } = getRangeAtPosition(
      0,
      stream.items.length,
      session.focusIndex >= 0 ? session.focusIndex : 0,
      5,
    );

    return {
      start: dropdownState.behindExpanded ? 0 : start,
      end: dropdownState.aheadExpanded ? stream.items.length : end,
    };
  }, [
    dropdownState.aheadExpanded,
    dropdownState.behindExpanded,
    session.focusIndex,
    stream.items,
  ]);

  const totalReadEntries = Math.max(session.focusIndex, session.readIndex) + 1;

  const handleMenuToggle = (open: boolean) => {
    if (open) {
      setDropdownState({
        behindExpanded: false,
        aheadExpanded: false,
      });
    }
  };

  const handleBehindExpand = (event: Event) => {
    event.preventDefault();
    setDropdownState((state) => ({
      ...state,
      behindExpanded: true,
    }));
  };

  const handleAheadExpand = (event: Event) => {
    event.preventDefault();
    setDropdownState((state) => ({
      ...state,
      aheadExpanded: true,
    }));
  };

  const handleUnreadEntrySelect = () => {
    onEntrySelect(session.focusIndex + 1);
  };

  const handleStreamMarkAsRead = $.useCallback(() => {
    openAlertDialog(
      {
        confirmButton: ({ onConfirm }, $) => $.html`
          <button class="button button-positive" type="button" @click=${onConfirm}>Mark all as read</button>
        `,
        cancelButton: ({ onCancel }, $) => $.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: onStreamMarkAsRead,
        title: `Mark all as read in this stream`,
        message:
          'Are you sure you want to mark all entires in this stream as read?',
      },
      $,
    );
  }, [onStreamMarkAsRead]);

  const handleScrollToEntry = $.useCallback((_event: Event, key: string) => {
    const index = Number.parseInt(key, 10);
    onEntrySelect(index);
  }, []);

  let entryMenuItems: MenuItem[] = [];

  if (range.start > 0) {
    entryMenuItems.push({
      type: 'button',
      key: 'expand_behind',
      children: $.html`
          <div class="MenuItem-content">
            <strong class="u-text-muted">${range.start} entries hidden</strong>
          </div>
        `,
      onAction: handleBehindExpand,
    });
  }

  entryMenuItems = entryMenuItems.concat(
    stream.items.slice(range.start, range.end).map((item, offset) => {
      const index = offset + range.start;
      const iconClass =
        index === session.focusIndex
          ? 'icon icon-16 icon-dot u-text-negative'
          : index <= session.readIndex
            ? 'icon icon-16 icon-dot u-text-muted'
            : index <= session.focusIndex
              ? 'icon icon-16 icon-dot u-text-positive'
              : null;
      const icon =
        iconClass !== null
          ? $.html`<i aria-hidden="true" class=${iconClass} role="img"></i>`
          : null;
      return {
        type: 'button',
        key: index.toString(),
        children: $.html`
            <div class="MenuItem-icon"><${icon}></div>
            <div class="MenuItem-content">${item.title}</div>
            <div class="MenuItem-hint">#${(index + 1).toString()}</div>
          `,
        onAction: handleScrollToEntry,
      } as MenuItem;
    }),
  );

  if (range.end < stream.items.length - 1) {
    entryMenuItems.push({
      type: 'button',
      key: 'expand_ahead',
      children: $.html`
          <div class="MenuItem-content">
            <strong class="u-text-muted">${stream.items.length - range.end} items hidden</strong>
          </div>
        `,
      onAction: handleAheadExpand,
    });
  }

  return Dropdown({
    trigger: ({ id, onMenuToggle, open }, $) => $.html`
      <button
        aria-expanded=${open.toString()}
        aria-label="Entry display settings"
        class="navbar-action"
        id=${id}
        type="button"
        @click=${onMenuToggle}
      >
        <i aria-hidden="true" class="icon icon-24 icon-checkmark" role="img"></i>
        <span class='badge badge-small badge-pill badge-overlap badge-default'>
          ${totalReadEntries > 0 ? totalReadEntries : ''}
        </span>
      </button>
    `,
    items: [
      {
        type: 'group',
        key: 'entries',
        label: 'Entries',
        childItems: entryMenuItems,
      },
      {
        type: 'separator',
        key: 'separator1',
      },
      {
        type: 'button',
        key: 'select_unread_entry',
        children: $.html`
            <div class="MenuItem-content">Scroll to unread position</div>
          `,
        onAction: handleUnreadEntrySelect,
      },
      {
        type: 'separator',
        key: 'separator2',
      },
      {
        type: 'button',
        key: 'mark_all_streams_as_read',
        children: $.html`
          <div class="MenuItem-content">Mark all as read...</div>
        `,
        disabled: isStreamUpdating,
        onAction: handleStreamMarkAsRead,
      },
    ],
    onMenuToggle: handleMenuToggle,
  });
});

function getRangeAtPosition(
  start: number,
  end: number,
  position: number,
  size: number,
): Range {
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
