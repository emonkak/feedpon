import { createComponent, type RenderContext } from 'barebind';
import type { Comment } from 'feedpon-messaging';

interface CommentViewProps {
  comment: Comment;
}

export const CommentView = createComponent(function CommentView(
  { comment }: CommentViewProps,
  $: RenderContext,
): unknown {
  return $.html`
    <div class="comment">
      <span class="comment-user">${comment.user}</span>
      <span class="comment-comment">${comment.comment}</span>
      <time class="comment-timestamp">${new Date(comment.timestamp).toLocaleDateString()}</time>
    </div>
  `;
});
