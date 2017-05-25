import React, { PureComponent } from 'react';

import CommentComponent from 'components/parts/Comment';
import { Comment } from 'messaging/types';

interface CommentListProps {
    comments: Comment[];
}

export default class CommentList extends PureComponent<CommentListProps, {}> {
    render() {
        const { comments } = this.props;

        const commentElements = comments.length > 0
            ? comments.map(item => <CommentComponent key={item.user} comment={item} />)
            : 'No comments yet in this entry.';

        return (
            <div className="comment-list">{commentElements}</div>
        );
    }
}
