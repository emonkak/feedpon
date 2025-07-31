import { component, type RenderContext } from 'barebind';
import type {
  Entry,
  EntryOrderKind,
  Feed,
  StreamFetchOptions,
  StreamViewKind,
} from 'feedpon-messaging';

import { Navbar } from '../common/Navbar.ts';
import { EntryDisplaySettingsDropdown } from './EntryDisplaySettingsDropdown.ts';
import { StreamFetchOptionsDropdown } from './StreamFetchOptionsDropdown.ts';

interface StreamNavbarProps {
  activeEntryIndex: number;
  canMarkStreamAsRead: boolean;
  entries: Entry[];
  feed: Feed | null;
  fetchOptions: StreamFetchOptions | null;
  isExpanded: boolean;
  isLoading: boolean;
  keepUnread: boolean;
  onChangeEntryOrder: (order: EntryOrderKind) => void;
  onChangeNumberOfEntries: (numEntries: number) => void;
  onChangeStreamView: (streamView: StreamViewKind) => void;
  onClearReadPosition: () => void;
  onCloseEntry: () => void;
  onMarkStreamAsRead: () => void;
  onReloadEntries: () => void;
  onScrollToEntry: (index: number) => void;
  onToggleOnlyUnread: () => void;
  onToggleSidebar: () => void;
  onToggleKeepUneread: () => void;
  readEntryIndex: number;
  streamView: StreamViewKind;
  title: string;
}

export function StreamHeader(
  {
    activeEntryIndex,
    canMarkStreamAsRead,
    entries,
    fetchOptions,
    isExpanded,
    isLoading,
    keepUnread,
    onChangeEntryOrder,
    onChangeNumberOfEntries,
    onChangeStreamView,
    onClearReadPosition,
    onCloseEntry,
    onMarkStreamAsRead,
    onReloadEntries,
    onScrollToEntry,
    onToggleOnlyUnread,
    onToggleSidebar,
    onToggleKeepUneread,
    readEntryIndex,
    streamView,
    title,
  }: StreamNavbarProps,
  context: RenderContext,
): unknown {
  return context.html`<${component(Navbar, {
    onToggleSidebar,
    progress: entries.length > 0 ? activeEntryIndex / entries.length : 0,
    children: context.html`
      <h1 class="navbar-title">
        <span class="stream-title u-text-truncate">${title}</span>
      </h1>
      <button
        type="button"
        disabled=${isLoading}
        class="navbar-action"
        @click=${onReloadEntries}
      >
        <i class="icon icon-24 icon-refresh"></i>
      </button>
      <${component(EntryDisplaySettingsDropdown, {
        activeEntryIndex,
        canMarkStreamAsRead,
        entries,
        keepUnread,
        onClearReadPosition,
        onMarkStreamAsRead,
        onScrollToEntry,
        onToggleKeepUneread,
        readEntryIndex,
        title,
      })}>
      <${
        isExpanded
          ? context.html`
            <button type="button" class="navbar-action" @click=${onCloseEntry}>
              <i class="icon icon-24 icon-close"></i>
            </button>
          `
          : null
      }>
      <${
        !isExpanded && fetchOptions
          ? component(StreamFetchOptionsDropdown, {
              fetchOptions,
              isLoading,
              onChangeEntryOrder,
              onChangeNumberOfEntries,
              onChangeStreamView,
              onToggleOnlyUnread,
              streamView,
            })
          : null
      }>
    `,
  })}>`;
}
