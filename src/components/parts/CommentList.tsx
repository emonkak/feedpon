import React from 'react';

import CommentComponent from 'components/parts/Comment';
import { Comment } from 'messaging/types';

interface CommentListProps {
    comments: Comment[];
    isLoading: boolean;
}

const CommentList: React.SFC<CommentListProps> = ({
    comments,
    isLoading 
}) => {
    if (isLoading) {
        return (
            <div className="comment-list">
                <div className="comment">
                    <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                    <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                    <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                </div>
            </div>
        );
    }

    const commentItems = comments.length > 0
        ? comments.map(item => <CommentComponent key={item.user} comment={item} />)
        : 'No comments yet in this entry.';

    return (
        <div className="comment-list">{commentItems}</div>
    );
}

export default CommentList;
