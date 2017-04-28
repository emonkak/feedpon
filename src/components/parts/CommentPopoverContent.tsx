import React, { PureComponent } from 'react';

import Comment from 'components/parts/Comment';
import { Comments } from 'messaging/types';

interface CommentPopoverContentProps {
    comments: Comments;
}

export default class CommentPopoverContent extends PureComponent<CommentPopoverContentProps, {}> {
    render() {
        const { comments } = this.props;

        if (!comments.isLoaded) {
            return (
                <div className="popover-content">
                    <div className="comment">
                        <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                        <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                        <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                    </div>
                    <div className="comment">
                        <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                        <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                        <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                    </div>
                </div>
            );
        }

        const commentElements = comments.items.length > 0
            ? comments.items.map(item => <Comment key={item.user} comment={item} />)
            : 'There aren’t any comments.';

        return (
            <div className="popover-content">{commentElements}</div>
        );
    }
}
