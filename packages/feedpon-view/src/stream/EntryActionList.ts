import { createComponent, html } from 'barebind';
import { type Entry, getEntryUrl } from 'feedpon-store';

import { EntryShareButton } from './EntryShareButton.ts';

interface EntryActionListProps {
  entry: Entry;
  isHatenaBookmarkEntryLoading: boolean;
  isHatenaBookmarkEntryShown: boolean;
  onHatenaBookmarkEntryToggle: (entryId: string, shown: boolean) => void;
}

export const EntryActionList = createComponent<EntryActionListProps>(
  function EntryActionList({
    isHatenaBookmarkEntryLoading,
    isHatenaBookmarkEntryShown,
    onHatenaBookmarkEntryToggle,
    entry,
  }) {
    const handleHatenaBookmarkEntryToggle = () => {
      onHatenaBookmarkEntryToggle(entry.id, !isHatenaBookmarkEntryShown);
    };

    return html`
      <div class="button-toolbar u-flex u-flex-align-items-center u-flex-justify-content-center">
        <button
          type="button"
          title="Comments..."
          class=${[
            'button button-pill',
            isHatenaBookmarkEntryShown
              ? 'button-default'
              : 'button-outline-default',
          ]}
          @click=${handleHatenaBookmarkEntryToggle}
        >
          <i
            class=${[
              'icon icon-20',
              isHatenaBookmarkEntryLoading
                ? 'icon-spinner animation-rotating'
                : 'icon-comments',
            ]}
          ></i>
        </button>
        <${EntryShareButton({ entry })}>
        <a
          class="button button-pill button-outline-default"
          href=${getEntryUrl(entry)}
          rel="noreferrer"
          target="_blank"
          title="Visit website"
        >
          <i class="icon icon-20 icon-external-link"></i>
        </a>
      </div>
    `;
  },
);
