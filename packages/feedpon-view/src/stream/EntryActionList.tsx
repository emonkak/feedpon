import type { RenderContext, TemplateResult } from '@emonkak/ebit';

import { component } from '@emonkak/ebit/directives.js';
import { EntryShareButton } from './EntryShareButton';

interface EntryActionListProps {
  commentsIsLoading: boolean;
  commentsIsShown: boolean;
  onToggleComments: (event: Event) => void;
  title: string;
  url: string;
}

export function EntryActionList(
  {
    commentsIsLoading,
    commentsIsShown,
    onToggleComments,
    title,
    url,
  }: EntryActionListProps,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <div class="button-toolbar u-flex u-flex-align-items-center u-flex-justify-content-center">
      <button
        type="button"
        class=${[
          'button button-pill',
          commentsIsShown ? 'button-default' : 'button-outline-default',
        ].join(' ')}
        title="Comments..."
        @click=${onToggleComments}
      >
        <i
          class=${[
            'icon icon-20',
            commentsIsLoading
              ? 'icon-spinner animation-rotating'
              : 'icon-comments',
          ].join(' ')}
        ></i>
      </button>
      <${component(EntryShareButton, { url, title })}>
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
}
