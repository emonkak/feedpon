import { createComponent, type RenderContext, Repeat } from 'barebind';
import type { Comment } from 'feedpon-messaging';

import { CommentView } from './CommentView.ts';

interface CommentPopoverProps {
  arrowOffset: number;
  comments: Comment[];
  isLoading: boolean;
}

export const CommentPopover = createComponent(function CommentPopover(
  { arrowOffset, comments, isLoading }: CommentPopoverProps,
  $: RenderContext,
): unknown {
  if (isLoading) {
    return $.html`
      <div class="popover popover-default is-pull-down">
        <div
          :style=${{ left: `calc(50% + ${arrowOffset}px)` }}
          class="popover-arrow"
        ></div>
        <div class="popover-content">
          <div class="comment">
            <span class="comment-user">
              <span class="placeholder placeholder-10 animation-shining"></div>
            </span>
            <span class="comment-comment">
              <span class="placeholder placeholder-60 animation-shining"></div>
            </span>
            <span class="comment-timestamp">
              <span class="placeholder placeholder-20 animation-shining"></div>
            </span>
          </div>
        </div>
      </div>
    `;
  }

  const content =
    comments.length > 0
      ? Repeat({
          source: comments,
          valueSelector: (comment) => CommentView({ comment }),
        })
      : $.html`No comments yet in this entry.`;

  return $.html`
    <div class="popover popover-default is-pull-down">
      <div class="popover-arrow" :style=${{ left: `calc(50% - ${arrowOffset}px)` }}></div>
      <div class="popover-content"><${content}></div>
    </div>
  `;
});
