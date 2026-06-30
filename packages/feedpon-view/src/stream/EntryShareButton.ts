import { createComponent, html } from 'barebind';
import { type Entry, getEntryUrl } from 'feedpon-store';
import { Popup } from '../primitives/Popup.ts';

interface EntryShareButtonProps {
  entry: Entry;
}

export const EntryShareButton = createComponent<EntryShareButtonProps>(
  function EntryShareButton({ entry }) {
    const [open, setOpen] = this.useState(false);

    const handlePopupClose = () => {
      setOpen(false);
    };

    const handlePopupToggle = () => {
      setOpen((open) => !open);
    };

    const url = getEntryUrl(entry);
    const title = entry.title ?? '';

    const popover = html`
      <div class="list-actions">
        <a
          class="list-actions-item link-soft"
          target="_blank"
          title="Share to Twitter"
          href=${
            'https://twitter.com/intent/tweet?text=' +
            encodeURIComponent(title + ' ' + url)
          }
          @click=${handlePopupClose}
          rel="noreferrer"
        >
          <i class="icon icon-24 icon-twitter"></i>
        </a>
        <a
          class="list-actions-item link-soft"
          target="_blank"
          title="Share to Facebook"
          href=${
            'https://www.facebook.com/sharer/sharer.php?u=' +
            encodeURIComponent(url)
          }
          @click=${handlePopupClose}
          rel="noreferrer"
        >
          <i class="icon icon-24 icon-facebook"></i>
        </a>
        <a
          class="list-actions-item link-soft"
          target="_blank"
          title="Save to Hatena Bookmark"
          href=${'http://b.hatena.ne.jp/entry/' + encodeURIComponent(url)}
          @click=${handlePopupClose}
          rel="noreferrer"
        >
          <i class="icon icon-24 icon-hatena-bookmark"></i>
        </a>
        <a
          class="list-actions-item link-soft"
          target="_blank"
          title="Save to Pocket"
          href=${
            'https://getpocket.com/save?url=' +
            encodeURIComponent(url) +
            '&title=' +
            encodeURIComponent(title)
          }
          @click={closePopup}
          rel="noreferrer"
        >
          <i class="icon icon-24 icon-pocket"></i>
        </a>
        <a
          class="list-actions-item link-soft"
          target="_blank"
          title="Save to Instapaper"
          href=${'http://www.instapaper.com/text?u=' + encodeURIComponent(url)}
          @click=${handlePopupClose}
          rel="noreferrer"
        >
          <i class="icon icon-24 icon-instapaper"></i>
        </a>
      </div>
    `;

    return html`
      <div class="button-group">
        <button
          type="button"
          class="button button-pill button-outline-default"
          title="Share..."
          @click=${handlePopupToggle}
        >
          <i class="icon icon-20 icon-share"></i>
        </button>
        <${Popup({
          open,
          children: popover,
          onClose: handlePopupClose,
        })}>
      </div>
    `;
  },
);
