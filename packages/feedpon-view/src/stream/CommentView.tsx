import type { RenderContext, TemplateResult } from '@emonkak/ebit';

import type { Comment } from 'feedpon-messaging';

interface CommentViewProps {
  comment: Comment;
}

export function CommentView(
  { comment }: CommentViewProps,
  context: RenderContext,
): TemplateResult {
  return context.html`
    <div class="comment">
      <span class="comment-user">${comment.user}</span>
      <span class="comment-comment">${comment.comment}</span>
      <time class="comment-timestamp">${new Date(comment.timestamp).toLocaleDateString()}</time>
    </div>
  `;
}
