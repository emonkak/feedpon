import { createComponent, type RenderContext } from 'barebind';

interface StreamFooterProps {
  canMarkAllEntriesAsRead: boolean;
  hasMoreEntries: boolean;
  isLoading: boolean;
  onLoadMoreEntries: () => void;
  onMarkAllEntiresAsRead: () => void;
}

export const StreamFooter = createComponent(function StreamFooter(
  {
    canMarkAllEntriesAsRead,
    hasMoreEntries,
    isLoading,
    onMarkAllEntiresAsRead,
    onLoadMoreEntries,
  }: StreamFooterProps,
  $: RenderContext,
): unknown {
  const handleLoadMoreEntries = $.useCallback(
    (event: Event) => {
      event.preventDefault();
      onLoadMoreEntries();
    },
    [onLoadMoreEntries],
  );

  if (hasMoreEntries) {
    if (isLoading) {
      return $.html`
        <footer class="stream-footer">
          <i class="icon icon-32 icon-spinner animation-rotating"></i>
        </footer>
      `;
    }

    return $.html`
      <footer class="stream-footer">
        <a class="link-strong" href="#" @click=${handleLoadMoreEntries}>
          Load more entries...
        </a>
      </footer>
    `;
  }

  return $.html`
    <footer class="stream-footer">
      <p>No more entries here.</p>
      <p>
        <button
          type="button"
          class="button button-positive"
          disabled=${!canMarkAllEntriesAsRead}
          @click=${onMarkAllEntiresAsRead}
        >
          Mark all entries as read
        </button>
      </p>
    </footer>
  `;
});
