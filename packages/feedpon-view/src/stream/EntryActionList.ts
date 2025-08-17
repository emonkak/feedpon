import { createComponent, type RenderContext } from 'barebind';

import { EntryShareButton } from './EntryShareButton.ts';

interface EntryActionListProps {
  commentsIsLoading: boolean;
  commentsIsShown: boolean;
  onToggleComments: (event: Event) => void;
  title: string;
  url: string;
}

export const EntryActionList = createComponent(function EntryActionList(
  {
    commentsIsLoading,
    commentsIsShown,
    onToggleComments,
    title,
    url,
  }: EntryActionListProps,
  $: RenderContext,
): unknown {
  return $.html`
    <div class="button-toolbar u-flex u-flex-align-items-center u-flex-justify-content-center">
      <button
        :class=${[
          'button button-pill',
          commentsIsShown ? 'button-default' : 'button-outline-default',
        ]}
        type="button"
        title="Comments..."
        @click=${onToggleComments}
      >
        <i
          :class=${[
            'icon icon-20',
            commentsIsLoading
              ? 'icon-spinner animation-rotating'
              : 'icon-comments',
          ]}
        ></i>
      </button>
      <${EntryShareButton({ url, title })}>
      <a
        class="button button-pill button-outline-default"
        href=${url}
        target="_blank"
        title="Visit website"
        rel="noreferrer"
      >
        <i class="icon icon-20 icon-external-link"></i>
      </a>
    </div>
  `;
});
