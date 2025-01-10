import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, component, optional } from '@emonkak/ebit/directives.js';
import type { Entry } from 'feedpon-messaging';

import { AlertDialog } from '../primitives/AlertDialog';
import { Dropdown } from '../primitives/Dropdown';
import type { MenuItem } from '../primitives/Menu';

export interface EntryDisplaySettingsDropdownProps {
  activeEntryIndex: number;
  canMarkStreamAsRead: boolean;
  entries: Entry[];
  keepUnread: boolean;
  onClearReadPosition: () => void;
  onMarkStreamAsRead: () => void;
  onScrollToEntry: (index: number) => void;
  onToggleKeepUneread: () => void;
  readEntryIndex: number;
  title: string;
}

interface Range {
  start: number;
  end: number;
}

export function EntryDisplaySettingsDropdown(
  {
    activeEntryIndex,
    canMarkStreamAsRead,
    onClearReadPosition,
    onScrollToEntry,
    onToggleKeepUneread,
    entries,
    keepUnread,
    onMarkStreamAsRead,
    readEntryIndex,
    title,
  }: EntryDisplaySettingsDropdownProps,
  context: RenderContext,
): TemplateResult {
  const [dropdownState, setDropdownState] = context.useState({
    aheadExpanded: false,
    behindExpanded: false,
  });

  const range = context.useMemo(() => {
    const { start, end } = getRangeAtPosition(
      0,
      entries.length,
      activeEntryIndex >= 0 ? activeEntryIndex : 0,
      5,
    );

    return {
      start: dropdownState.behindExpanded ? 0 : start,
      end: dropdownState.aheadExpanded ? entries.length : end,
    };
  }, [
    activeEntryIndex,
    entries,
    dropdownState.aheadExpanded,
    dropdownState.behindExpanded,
  ]);

  const totalReadEntries = entries
    .slice(0, readEntryIndex + 1)
    .reduce((total, entry) => total + (entry.markedAsRead ? 0 : 1), 0);

  const handleDropdownToggle = context.useCallback((open: boolean) => {
    if (open) {
      setDropdownState({
        behindExpanded: false,
        aheadExpanded: false,
      });
    }
  }, []);

  const handleExpandBehind = context.useCallback((event: Event) => {
    event.preventDefault();
    setDropdownState((state) => ({
      ...state,
      behindExpanded: true,
    }));
  }, []);

  const handleExpandAhead = context.useCallback((event: Event) => {
    event.preventDefault();
    setDropdownState((state) => ({
      ...state,
      aheadExpanded: true,
    }));
  }, []);

  const handleScrollToUnreadPosition = context.useCallback(() => {
    onScrollToEntry(activeEntryIndex + 1);
  }, [onScrollToEntry, activeEntryIndex]);

  const handleClearReadPosition = context.useCallback(() => {
    onClearReadPosition();
  }, [onClearReadPosition]);

  const handleKeepUnread = context.useCallback(() => {
    onToggleKeepUneread();
  }, [onToggleKeepUneread]);

  const handleMarkAllAsRead = context.useCallback(() => {
    AlertDialog.open(
      {
        confirmButton: ({ onConfirm }, context) => context.html`
          <button class="button button-positive" type="button" @click=${onConfirm}>Mark all as read</button>
        `,
        cancelButton: ({ onCancel }, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${onCancel}>Cancel</button>
        `,
        onConfirm: onMarkStreamAsRead,
        title: `Mark all as read in "${title}"`,
        message: `Are you sure you want to mark all entires in this stream as read?`,
      },
      context,
    );
  }, [onMarkStreamAsRead, title]);

  const handleScrollToEntry = context.useCallback(
    (_event: Event, key: string) => {
      const index = Number.parseInt(key, 10);
      onScrollToEntry(index);
    },
    [],
  );

  let entryMenuItems: MenuItem[] = [];

  if (range.start > 0) {
    entryMenuItems.push({
      type: 'button',
      key: 'expand_behind',
      children: context.html`
        <div class="MenuItem-content">
          <strong class="u-text-muted">${range.start} entries hidden</strong>
        </div>
      `,
      onAction: handleExpandBehind,
    });
  }

  entryMenuItems = entryMenuItems.concat(
    entries.slice(range.start, range.end).map((entry, offset) => {
      const index = offset + range.start;
      const iconClass =
        index === activeEntryIndex
          ? 'icon icon-16 icon-dot u-text-negative'
          : entry.markedAsRead
            ? 'icon icon-16 icon-dot u-text-muted'
            : index <= readEntryIndex
              ? 'icon icon-16 icon-dot u-text-positive'
              : null;
      const icon = optional(
        iconClass !== null
          ? context.html`<i aria-hidden="true" class=${iconClass} role="img"></i>`
          : null,
      );
      return {
        type: 'button',
        key: index.toString(),
        children: context.html`
          <div class="MenuItem-icon"><${icon}></div>
          <div class="MenuItem-content">${entry.title}</div>
          <div class="MenuItem-hint">#${(index + 1).toString()}</div>
        `,
        onAction: handleScrollToEntry,
      } as MenuItem;
    }),
  );

  if (range.end < entries.length - 1) {
    entryMenuItems.push({
      type: 'button',
      key: 'expand_ahead',
      children: context.html`
        <div class="MenuItem-content">
          <strong class="u-text-muted">${entries.length - range.end} entries hidden</strong>
        </div>
      `,
      onAction: handleExpandAhead,
    });
  }

  const dropdown = component(Dropdown, {
    trigger: ({ id, onToggle, open }, context) => context.html`
      <button
        aria-expanded=${open.toString()}
        aria-label="Entry display settings"
        class="navbar-action"
        id=${id}
        type="button"
        @click=${onToggle}
      >
        <i aria-hidden="true" class="icon icon-24 icon-checkmark" role="img"></i>
        <span
          class=${classMap({
            badge: true,
            'badge-small': true,
            'badge-pill': true,
            'badge-overlap': true,
            [keepUnread ? 'badge-default' : 'badge-negative']: true,
          })}
        >
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
        key: 'scroll_to_unread_position',
        children: context.html`
          <div class="MenuItem-content">Scroll to unread position</div>
        `,
        onAction: handleScrollToUnreadPosition,
      },
      {
        type: 'button',
        key: 'clear_read_position',
        children: context.html`
          <div class="MenuItem-content">Clear read position</div>
        `,
        disabled: totalReadEntries === 0,
        onAction: handleClearReadPosition,
      },
      {
        type: 'separator',
        key: 'separator2',
      },
      {
        type: 'button',
        key: 'mark_all_as_read',
        children: context.html`
          <div class="MenuItem-content">Mark all as read...</div>
        `,
        disabled: !canMarkStreamAsRead,
        onAction: handleMarkAllAsRead,
      },
      {
        type: 'separator',
        key: 'separator3',
      },
      {
        type: 'button',
        key: 'keep_unread',
        checked: keepUnread,
        children: context.html`
          <div class="MenuItem-icon">
            <${optional(
              keepUnread
                ? context.html`<i aria-hidden="true" class="icon icon-16 icon-checkmark" role="img"></i>`
                : null,
            )}>
          </div>
          <div class="MenuItem-content">Keep unread</div>
        `,
        disabled: !canMarkStreamAsRead,
        onAction: handleKeepUnread,
      },
    ],
    onToggle: handleDropdownToggle,
  });

  return context.html`<${dropdown}>`;
}

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
