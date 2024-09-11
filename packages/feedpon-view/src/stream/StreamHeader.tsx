import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, optional } from '@emonkak/ebit/directives.js';
import type {
  Entry,
  EntryOrderKind,
  Feed,
  StreamFetchOptions,
  StreamViewKind,
} from 'feedpon-messaging';
import React from 'react';

import { Navbar } from '../common/components/Navbar';
import { reactElement } from '../common/directives/reactElement';
import { EntriesDropdown } from './EntriesDropdown';
import { StreamFetchOptionsDropdown } from './StreamFetchOptionsDropdown';

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
  onToggleUnreadKeeping: () => void;
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
    onToggleUnreadKeeping,
    readEntryIndex,
    streamView,
    title,
  }: StreamNavbarProps,
  context: RenderContext,
): TemplateResult {
  return context.html`<${component(Navbar, {
    onToggleSidebar,
    progress: entries.length > 0 ? activeEntryIndex / entries.length : 0,
    child: context.html`
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
      <${reactElement(
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
          title={title}
        />,
      )}>
      <${optional(
        isExpanded
          ? context.html`
            <button type="button" class="navbar-action" @click=${onCloseEntry}>
              <i class="icon icon-24 icon-close"></i>
            </button>
          `
          : null,
      )}>
      <${optional(
        !isExpanded && fetchOptions
          ? reactElement(
              <StreamFetchOptionsDropdown
                fetchOptions={fetchOptions}
                isLoading={isLoading}
                onChangeEntryOrder={onChangeEntryOrder}
                onChangeNumberOfEntries={onChangeNumberOfEntries}
                onChangeStreamView={onChangeStreamView}
                onToggleOnlyUnread={onToggleOnlyUnread}
                streamView={streamView}
              />,
            )
          : null,
      )}>
    `,
  })}>`;
}
