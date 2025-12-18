import { createComponent, type RenderContext } from 'barebind';
import type { Session, SessionSettings, Stream } from 'feedpon-store';

import { Navbar } from '../primitives/Navbar.ts';
import { SessionSettingsDropdown } from './SessionSettingsDropdown.ts';
import { StreamDropdown } from './StreamDropdown.ts';

interface StreamNavbarProps {
  isStreamLoading: boolean;
  isStreamUpdating: boolean;
  onEntrySelect: (index: number) => void;
  onEntryShrink: () => void;
  onSessionSettingsUpdate: (
    newSessionSettings: SessionSettings,
    oldSessionSettings: SessionSettings,
  ) => void;
  onSidebarToggle: () => void;
  onStreamMarkAsRead: () => Promise<void>;
  onStreamReload: () => Promise<void>;
  session: Session | null;
  stream: Stream | null;
}

export const StreamHeader = createComponent(function StreamHeader(
  {
    isStreamLoading,
    isStreamUpdating,
    onEntrySelect,
    onEntryShrink,
    onSessionSettingsUpdate,
    onSidebarToggle,
    onStreamReload,
    onStreamMarkAsRead,
    session,
    stream,
  }: StreamNavbarProps,
  $: RenderContext,
): unknown {
  return Navbar({
    onSidebarToggle,
    progress:
      stream !== null && session !== null && stream.items.length > 0
        ? session.focusIndex / stream.items.length
        : 0,
    children: $.html`
      <h1 class="navbar-title">
        <span class="stream-title u-text-truncate">${stream?.title ?? ''}</span>
      </h1>
      <button
        type="button"
        disabled=${isStreamLoading}
        class="navbar-action"
        @click=${onStreamReload}
      >
        <i class="icon icon-24 icon-refresh"></i>
      </button>
      <${
        session !== null && stream !== null
          ? StreamDropdown({
              isStreamUpdating,
              onEntrySelect,
              onStreamMarkAsRead,
              session,
              stream,
            })
          : null
      }>
      <${
        session !== null && session.expandedIndex >= 0
          ? $.html`
            <button type="button" class="navbar-action" @click=${onEntryShrink}>
              <i class="icon icon-24 icon-close"></i>
            </button>
          `
          : null
      }>
      <${
        session !== null && session.expandedIndex < 0
          ? SessionSettingsDropdown({
              disabled: isStreamLoading,
              sessionSettings: session.settings,
              onSessionSettingsUpdate,
            })
          : null
      }>
    `,
  });
});
