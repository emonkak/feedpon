import type { RenderContext, TemplateResult } from '@emonkak/ebit';

export function ExpandedEntryPlaceholder(
  _props: {},
  context: RenderContext,
): TemplateResult {
  return context.html`
    <article class="entry is-expanded">
      <div class="container">
        <header class="entry-header">
          <h2 class="entry-title">
            <span class="placeholder placeholder-80 animation-shining"></span>
          </h2>
          <div class="entry-metadata">
            <span class="placeholder placeholder-60 animation-shining"></span>
          </div>
        </header>
        <div class="entry-content u-clearfix u-text-wrap">
          <p>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-60 animation-shining"></span>
          </p>
          <p>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-80 animation-shining"></span>
          </p>
          <p>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-100 animation-shining"></span>
            <span class="placeholder placeholder-40 animation-shining"></span>
          </p>
        </div>
        <footer class="entry-footer">
          <div class="button-toolbar u-text-center">
            <span class="button button-pill button-outline-default">
              <i class="icon icon-20 icon-comments"></i>
            </span>
            <span class="button button-pill button-outline-default">
              <i class="icon icon-20 icon-share"></i>
            </span>
            <span class="button button-pill button-outline-default">
              <i class="icon icon-20 icon-external-link"></i>
            </span>
          </div>
        </footer>
      </div>
    </article>
  `;
}

export function CollapsedEntryPlaceholder(
  _props: {},
  context: RenderContext,
): TemplateResult {
  return context.html`
    <article class="entry">
      <div class="container">
        <header class="entry-header">
          <h2 class="entry-title">
            <span class="placeholder placeholder-80 animation-shining"></span>
          </h2>
          <div class="entry-metadata">
            <span class="placeholder placeholder-60 animation-shining"></span>
          </div>
        </header>
        <div class="entry-summary">
          <span class="placeholder placeholder-100 animation-shining"></span>
        </div>
      </div>
    </article>
  `;
}
