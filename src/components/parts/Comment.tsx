import React from 'react';

import { Comment } from 'messaging/types';

interface CommentProps {
    comment: Comment;
}

const CommentComponent: React.SFC<CommentProps> = (props) => {
    const { comment } = props;

    return (
        <div className="comment">
            <span className="comment-user">{comment.user}</span>
            <span className="comment-comment">{comment.comment}</span>
            <time className="comment-timestamp">{new Date(comment.timestamp).toLocaleDateString()}</time>
        </div>
    );
}

export default CommentComponent;
