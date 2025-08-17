import { createComponent, type RenderContext, Repeat } from 'barebind';
import type { FullContent } from 'feedpon-messaging';

import { EmbeddedHTML } from '../primitives/EmbeddedHTML.ts';

interface FullContentsProps {
  isLoading: boolean;
  isNotFound: boolean;
  items: FullContent[];
  onFetchNext: (event: Event) => void;
}

export const FullContents = createComponent(function FullContents(
  { isLoading, isNotFound, items, onFetchNext }: FullContentsProps,
  $: RenderContext,
): unknown {
  if (items.length === 0) {
    return $.html`
      <div class="entry-content u-clearfix u-text-wrap">
        <div class="message message-positive">
          The full content of this entry could not be extracted.
        </div>
      </div>
    `;
  }

  const pages = Repeat({
    source: items,
    valueSelector: (fullContent, index) => $.html`
      <section class="entry-page">
        <${
          index > 0
            ? $.html`
              <header class="entry-page-header">
                <h2 class="entry-page-title">
                  <a
                    class="link-soft"
                    href=${fullContent.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Page ${index + 1}
                  </a>
                </h2>
              </header>
            `
            : $.html``
        }>
        <${EmbeddedHTML({
          baseUrl: fullContent.url,
          class: 'entry-page-content',
          html: fullContent.content,
        })}>
      </section>
    `,
  });

  let nextPageButton: unknown = null;

  if (isNotFound) {
    nextPageButton = $.html`
      <div class="message message-positive">
        The next page cannot be extracted.
      </div>
    `;
  } else {
    const latestItem = items[items.length - 1];
    if (latestItem?.nextPageUrl) {
      nextPageButton = isLoading
        ? $.html`
          <button
            type="button"
            class="button button-block button-outline-positive"
            disabled
          >
            <i class="icon icon-20 icon-spinner animation-rotating"></i>
          </button>
        `
        : $.html`
          <button
            type="button"
            class="button button-block button-outline-positive"
            @click=${onFetchNext}
          >
            Next page
          </button>
        `;
    }
  }

  return $.html`
    <div class="entry-content u-clearfix u-text-wrap">
      <${pages}>
      <${nextPageButton ?? $.html``}>
    </div>
  `;
});
