import { createComponent, html } from 'barebind';

interface StreamFooterProps {
  canMarkAsRead: boolean;
  hasMoreEntries: boolean;
  isStreamLoading: boolean;
  onStreamLoadMoreEntries: () => void;
  onStreamMarkAsRead: () => void;
}

export const StreamFooter = createComponent<StreamFooterProps>(
  function StreamFooter({
    canMarkAsRead,
    hasMoreEntries,
    isStreamLoading,
    onStreamLoadMoreEntries,
    onStreamMarkAsRead,
  }) {
    const handleStreamFetch = (event: Event) => {
      event.preventDefault();
      onStreamLoadMoreEntries();
    };

    if (hasMoreEntries) {
      if (isStreamLoading) {
        return html`
          <footer class="stream-footer">
            <i class="icon icon-32 icon-spinner animation-rotating"></i>
          </footer>
        `;
      }

      return html`
        <footer class="stream-footer">
          <a class="link-strong" href="#" @click=${handleStreamFetch}>
            Load more entries...
          </a>
        </footer>
      `;
    }

    return html`
      <footer class="stream-footer">
        <p>No more entries here.</p>
        <p>
          <button
            type="button"
            class="button button-positive"
            disabled=${!canMarkAsRead}
            @click=${onStreamMarkAsRead}
          >
            Mark all entries as read
          </button>
        </p>
      </footer>
    `;
  },
);
