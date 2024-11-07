import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  classMap,
  component,
  nonKeyedList,
  optional,
} from '@emonkak/ebit/directives.js';
import type { Entry } from 'feedpon-messaging';
import { ConfirmModal } from '../primitives/ConfirmModal';
import { Menu } from '../primitives/Menu';

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

interface Slice {
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
    isOpened: false,
    aheadExpanded: false,
    behindExpanded: false,
  });

  const toggleId = context.useId();

  const slice = context.useMemo(() => {
    const { start, end } = getSliceAtPosition(
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

  const closeDropdown = context.useCallback(() => {
    setDropdownState({
      behindExpanded: false,
      aheadExpanded: false,
      isOpened: false,
    });
  }, []);

  const toggleDropdown = context.useCallback(() => {
    setDropdownState((state) => ({
      behindExpanded: false,
      aheadExpanded: false,
      isOpened: !state.isOpened,
    }));
  }, []);

  const handleExpandBehind = context.useCallback(() => {
    setDropdownState((state) => ({
      ...state,
      behindExpanded: true,
    }));
  }, []);

  const handleExpandAhead = context.useCallback(() => {
    setDropdownState((state) => ({
      ...state,
      aheadExpanded: true,
    }));
  }, []);

  const handleScrollToUnreadPosition = context.useCallback(() => {
    onScrollToEntry(activeEntryIndex + 1);
    closeDropdown();
  }, [onScrollToEntry, activeEntryIndex]);

  const handleClearReadPosition = context.useCallback(() => {
    onClearReadPosition();
    closeDropdown();
  }, [onClearReadPosition]);

  const handleKeepUnread = context.useCallback(() => {
    onToggleKeepUneread();
    closeDropdown();
  }, [onToggleKeepUneread]);

  const handleMarkAllAsRead = context.useCallback(() => {
    ConfirmModal.open(
      {
        confirmButton: (close, context) => context.html`
          <button class="button button-positive" type="button" @click=${close}>Mark all as read</button>
        `,
        cancelButton: (close, context) => context.html`
          <button class="button button-outline-default" type="button" @click=${close}>Cancel</button>
        `,
        onConfirm: onMarkStreamAsRead,
        title: `Mark all as read in "${title}"`,
        message: `Are you sure you want to mark all entires in this stream as read?`,
      },
      context,
    );
  }, [onMarkStreamAsRead, title]);

  const menuItems = context.html`
    <div class="MenuSection" role="group">
      <div class="MenuHeading" role="heading">Entries</div>
      <${optional(
        slice.start > 0
          ? context.html`
            <button class="MenuItem"
              role="menuitem"
              type="button"
              @click=${handleExpandBehind}
            >
              <div class="MenuItem-content">
                <strong class="u-text-muted">${slice.start} entries hidden</strong>
              </div>
            </button>
          `
          : null,
      )}>
      <${nonKeyedList(
        entries.slice(slice.start, slice.end),
        (entry, offset) => {
          const index = offset + slice.start;
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
          return context.html`
            <button
              class="MenuItem"
              role="menuitem"
              type="button"
              @click=${() => {
                onScrollToEntry(index);
                closeDropdown();
              }}
            >
              <div class="MenuItem-icon"><${icon}></div>
              <div class="MenuItem-content">${entry.title}</div>
              <div class="MenuItem-hint">#${(index + 1).toString()}</div>
            </button>
          `;
        },
      )}>
      <${optional(
        slice.end < entries.length - 1
          ? context.html`
          <button
            class="MenuItem"
            role="menuitem"
            type="button"
            @click=${handleExpandAhead}
          >
            <div class="MenuItem-content">
              <strong class="u-text-muted">${entries.length - slice.end} entries hidden</strong>
            </div>
          </button>
        `
          : null,
      )}>
    </div>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      disabled=${readEntryIndex < entries.length}
      role="menuitem"
      type="button"
      @click=${handleScrollToUnreadPosition}
    >
      <div class="MenuItem-content">Scroll to unread position</div>
    </button>
    <button
      class="MenuItem"
      disabled=${totalReadEntries === 0}
      role="menuitem"
      type="button"
      @click=${handleClearReadPosition}
    >
      <div class="MenuItem-content">Clear read position</div>
    </button>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      disabled=${!canMarkStreamAsRead}
      role="menuitem"
      type="button"
      @click=${handleMarkAllAsRead}
    >
      <div class="MenuItem-content">Mark all as read...</div>
    </button>
    <hr class="MenuSeparator">
    <button
      class="MenuItem"
      role="menuitem"
      type="button"
      @click=${handleKeepUnread}
    >
      <div class="MenuItem-icon">
        <${optional(
          keepUnread
            ? context.html`<i aria-hidden="true" class="icon icon-16 icon-checkmark" role="img"></i>`
            : null,
        )}>
      </div>
      <div class="MenuItem-content">Keep unread</div>
    </button>
  `;

  return context.html`
    <div class="Drodown">
      <button
        aria-label="Entry display settings"
        class="navbar-action"
        id=${toggleId}
        type="button"
        @click=${toggleDropdown}
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
      <${component(Menu, {
        anchorTarget: toggleId,
        children: menuItems,
        onClose: closeDropdown,
        open: dropdownState.isOpened,
      })}>
    </div>
  `;
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
