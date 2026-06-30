import { createComponent, html } from 'barebind';
import type { FullContent } from 'feedpon-store';

import { EmbeddedHTML } from '../primitives/EmbeddedHTML.ts';

interface FullContentsProps {
  fullContents: FullContent[];
  isLoading: boolean;
  onFullContentsFetch: () => void;
}

export const FullContents = createComponent<FullContentsProps>(
  function FullContents({ isLoading, fullContents, onFullContentsFetch }) {
    const fullContentList = fullContents.map(
      (fullContent, index) => html`
        <section class="entry-page">
          <${
            index > 0
              ? html`
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
              : null
          }>
          <${
            fullContent.content !== ''
              ? EmbeddedHTML({
                  origin: fullContent.url,
                  html: fullContent.content,
                })
              : html`
                <div class="message message-positive">
                  Could not extract the full content from this page.
                </div>
              `
          }>
        </section>
      `,
    );

    const nextButton =
      fullContents.at(-1)?.nextUrl != null
        ? html`
          <button
            class="button button-block button-outline-positive"
            disabled=${isLoading}
            type="button"
            @click=${onFullContentsFetch}
          >
            <${
              isLoading
                ? html`<i class="icon icon-20 icon-spinner animation-rotating"></i>`
                : html`Next page`
            }>
          </button>
        `
        : null;

    return html`
      <div class="entry-content u-clearfix u-text-wrap">
        <${fullContentList}>
        <${nextButton}>
      </div>
    `;
  },
);
