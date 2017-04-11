import React, { PureComponent } from 'react';
import monent from 'moment';

import { Comment } from 'messaging/types';

interface CommentProps {
    comment: Comment;
}

export default class CommentComponent extends PureComponent<CommentProps, {}> {
    render() {
        const { comment } = this.props;

        return (
            <div className="comment">
                <span className="comment-user">{comment.user}</span>
                <span className="comment-comment">{comment.comment}</span>
                <time className="comment-timestamp">{monent(new Date(comment.timestamp)).format('L')}</time>
            </div>
        );
    }
}
