import React from 'react';

import CommentComponent from 'components/parts/Comment';
import { Comment } from 'messaging/types';

interface CommentPopoverProps {
    arrowOffset: number;
    comments: Comment[];
    isLoading: boolean;
}

const CommentPopover: React.SFC<CommentPopoverProps> = ({
    arrowOffset,
    comments,
    isLoading
}) => {
    if (isLoading) {
        return (
            <div className="popover popover-default popover-bottom">
                <div className="popover-arrow" style={{ left: `calc(50% + ${arrowOffset}px)` }} />
                <div className="popover-content">
                    <div className="comment">
                        <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                        <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                        <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                    </div>
                </div>
            </div>
        );
    }

    const commentItems = comments.length > 0
        ? comments.map(item => <CommentComponent key={item.user} comment={item} />)
        : 'No comments yet in this entry.';

    return (
        <div className="popover popover-default popover-bottom">
            <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
            <div className="popover-content">
                {commentItems}
            </div>
        </div>
    );
}

export default CommentPopover;
