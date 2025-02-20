import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, styleMap } from '@emonkak/ebit/directives.js';

import { createPopupHook } from '../common/hooks/popupHook.ts';
import { Dialog } from '../primitives/Dialog.ts';

interface EntryShareButtonProps {
  url: string;
  title: string;
}

export function EntryShareButton(
  { url, title }: EntryShareButtonProps,
  context: RenderContext,
): TemplateResult {
  const popup = context.use(createPopupHook(false, ['up', 'down']));

  const handleTogglePopup = context.useCallback(
    (event: Event) => {
      if (popup.opened) {
        popup.close();
      } else {
        popup.open(event.currentTarget as Element);
      }
    },
    [popup.opened],
  );

  const popover = context.html`
    <div
      class=${[
        'popover',
        'popover-default',
        'is-pull-' + popup.pullDirection,
      ].join(' ')}
    >
      <div class="popover-arrow"></div>
      <div class="popover-content">
        <div class="list-actions">
          <a
            class="list-actions-item link-soft"
            target="_blank"
            title="Share to Twitter"
            href=${
              'https://twitter.com/intent/tweet?text=' +
              encodeURIComponent(title + ' ' + url)
            }
            @click=${popup.close}
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
            @click=${popup.close}
            rel="noreferrer"
          >
            <i class="icon icon-24 icon-facebook"></i>
          </a>
          <a
            class="list-actions-item link-soft"
            target="_blank"
            title="Save to Hatena Bookmark"
            href=${'http://b.hatena.ne.jp/entry/' + encodeURIComponent(url)}
            @click=${popup.close}
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
            @click=${popup.close}
            rel="noreferrer"
          >
            <i class="icon icon-24 icon-instapaper"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  return context.html`
    <div class="button-group">
      <button
        type="button"
        class="button button-pill button-outline-default"
        title="Share..."
        @click=${handleTogglePopup}
      >
        <i class="icon icon-20 icon-share"></i>
      </button>
      <${component(Dialog, {
        open: popup.opened,
        children: popover,
        modal: false,
        onClose: popup.close,
        ownProps: {
          style: styleMap(popup.style),
          class: ['popup', 'is-pull-' + popup.pullDirection].join(' '),
        },
      })}>
    </div>
  `;
}
