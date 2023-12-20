import React from 'react';

import type { Comment } from 'feedpon-messaging';

interface CommentProps {
  comment: Comment;
}

export default function CommentComponent({ comment }: CommentProps) {
  return (
    <div className="comment">
      <span className="comment-user">{comment.user}</span>
      <span className="comment-comment">{comment.comment}</span>
      <time className="comment-timestamp">
        {new Date(comment.timestamp).toLocaleDateString()}
      </time>
    </div>
  );
}
