import { createComponent, html } from 'barebind';

import type { Entry } from 'feedpon-store';

interface EntryNavProps {
  entry: Entry;
  isFullContentsLoading: boolean;
  isFullContentsShown: boolean;
  onFullContentsToggle: (entryId: string, shown: boolean) => void;
}

export const EntryNav = createComponent<EntryNavProps>(function EntryNav({
  entry,
  isFullContentsLoading,
  isFullContentsShown,
  onFullContentsToggle,
}) {
  const handleFullContentsToggle = () => {
    onFullContentsToggle(entry.id, !isFullContentsShown);
  };

  return html`
    <nav class="entry-nav">
      <div class="button-toolbar">
        <button
          type="button"
          title="Fetch full content"
          disabled=${isFullContentsLoading}
          class=${[
            'button',
            'button-pill',
            isFullContentsShown ? 'button-default' : 'button-outline-default',
          ]}
          @click=${handleFullContentsToggle}
        >
          <i
            class=${[
              'icon',
              'icon-20',
              isFullContentsLoading
                ? 'icon-spinner animation-rotating'
                : 'icon-page-overview',
            ]}
          ></i>
        </button>
      </div>
    </nav>
  `;
});
