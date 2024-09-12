import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, list } from '@emonkak/ebit/directives.js';
import type { FullContent } from 'feedpon-messaging';

import { EmbeddedHTML } from '../common/components/EmbeddedHTML';

interface FullContentsProps {
  isLoading: boolean;
  isNotFound: boolean;
  items: FullContent[];
  onFetchNext: (event: Event) => void;
}

export function FullContents(
  { isLoading, isNotFound, items, onFetchNext }: FullContentsProps,
  context: RenderContext,
): TemplateResult {
  if (items.length === 0) {
    return context.html`
      <div class="entry-content u-clearfix u-text-wrap">
        <div class="message message-positive">
          The full content of this entry could not be extracted.
        </div>
      </div>
    `;
  }

  const pages = list(
    items,
    (fullContent, index) => context.html`
      <section class="entry-page">
        <${
          index > 0
            ? context.html`
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
            : context.html``
        }>
        <${component(EmbeddedHTML, {
          baseUrl: fullContent.url,
          class: 'entry-page-content',
          html: fullContent.content,
        })}>
      </section>
    `,
  );

  let nextPageButton: TemplateResult | null = null;

  if (isNotFound) {
    nextPageButton = context.html`
      <div class="message message-positive">
        The next page cannot be extracted.
      </div>
    `;
  } else {
    const latestItem = items[items.length - 1];
    if (latestItem?.nextPageUrl) {
      nextPageButton = isLoading
        ? context.html`
          <button
            type="button"
            class="button button-block button-outline-positive"
            disabled
          >
            <i class="icon icon-20 icon-spinner animation-rotating"></i>
          </button>
        `
        : context.html`
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

  return context.html`
    <div class="entry-content u-clearfix u-text-wrap">
      <${pages}>
      <${nextPageButton ?? context.html``}>
    </div>
  `;
}
