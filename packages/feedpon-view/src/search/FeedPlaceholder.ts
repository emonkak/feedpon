import { createComponent, type RenderContext } from 'barebind';

export const FeedPlaceholder = createComponent(function FeedPlaceholder(
  _props: {},
  $: RenderContext,
): unknown {
  return $.html`
    <li class="list-group-item">
      <div class="link-strong">
        <span class="placeholder placeholder-40 animation-shining"></span>
      </div>
      <div class="u-text-7">
        <span class="placeholder placeholder-10 animation-shining"></span>
      </div>
      <div class="u-text-muted">
        <span class="placeholder placeholder-100 animation-shining"></span>
        <span class="placeholder placeholder-60 animation-shining"></span>
      </div>
    </li>
  `;
});
