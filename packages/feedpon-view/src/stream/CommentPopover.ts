import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  Either,
  component,
  nonKeyedList,
  styleMap,
} from '@emonkak/ebit/directives.js';
import type { Comment } from 'feedpon-messaging';

import { CommentView } from './CommentView.ts';

interface CommentPopoverProps {
  arrowOffset: number;
  comments: Comment[];
  isLoading: boolean;
}

export function CommentPopover(
  { arrowOffset, comments, isLoading }: CommentPopoverProps,
  context: RenderContext,
): TemplateResult {
  if (isLoading) {
    return context.html`
      <div class="popover popover-default is-pull-down">
        <div
          class="popover-arrow"
          style=${styleMap({ left: `calc(50% + ${arrowOffset}px)` })}
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
      ? Either.left(
          nonKeyedList(comments, (comment) =>
            component(CommentView, { comment }),
          ),
        )
      : Either.right(context.html`No comments yet in this entry.`);

  return context.html`
    <div class="popover popover-default is-pull-down">
      <div class="popover-arrow" style=${styleMap({ left: `calc(50% - ${arrowOffset}px)` })}></div>
      <div class="popover-content"><${content}></div>
    </div>
  `;
}
