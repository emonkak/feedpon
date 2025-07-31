import type { RenderContext } from 'barebind';
import type { Comment } from 'feedpon-messaging';

interface CommentViewProps {
  comment: Comment;
}

export function CommentView(
  { comment }: CommentViewProps,
  context: RenderContext,
): unknown {
  return context.html`
    <div class="comment">
      <span class="comment-user">${comment.user}</span>
      <span class="comment-comment">${comment.comment}</span>
      <time class="comment-timestamp">${new Date(comment.timestamp).toLocaleDateString()}</time>
    </div>
  `;
}
