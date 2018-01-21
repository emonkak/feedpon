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
            <div className="popover popover-default is-pull-down">
                <div className="popover-arrow" style={{ left: `calc(50% + ${arrowOffset}px)` }} />
                <div className="popover-content">
                    <div className="comment">
                        <span className="comment-user"><span className="placeholder placeholder-10 animation-shining" /></span>
                        <span className="comment-comment"><span className="placeholder placeholder-60 animation-shining" /></span>
                        <span className="comment-timestamp"><span className="placeholder placeholder-20 animation-shining" /></span>
                    </div>
                </div>
            </div>
        );
    }

    const commentItems = comments.length > 0
        ? comments.map((item) => <CommentComponent key={item.user} comment={item} />)
        : 'No comments yet in this entry.';

    return (
        <div className="popover popover-default is-pull-down">
            <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
            <div className="popover-content">
                {commentItems}
            </div>
        </div>
    );
};

export default CommentPopover;
