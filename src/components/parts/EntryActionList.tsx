import React from 'react';
import classnames from 'classnames';

import { EntryPopoverKind } from 'messaging/types';

interface EntryActionListProps {
    commentsIsLoading: boolean;
    onSwitchCommentPopover: React.MouseEventHandler<any>;
    onSwitchSharePopover: React.MouseEventHandler<any>;
    popover: EntryPopoverKind;
    url: string;
}

const EntryActionList: React.SFC<EntryActionListProps> = ({
    commentsIsLoading,
    onSwitchCommentPopover,
    onSwitchSharePopover,
    popover,
    url 
}) => {
    return (
        <div className="button-toolbar u-text-center">
            <button
                className={classnames('button button-pill', popover === 'comment' ? 'button-default' : 'button-outline-default')}
                title="Comments..."
                onClick={onSwitchCommentPopover}>
                <i className={classnames('icon icon-20', commentsIsLoading ? 'icon-spinner icon-rotating' : 'icon-comments')} />
            </button>
            <button
                className={classnames('button button-pill', popover === 'share' ? 'button-default' : 'button-outline-default')}
                title="Share..."
                onClick={onSwitchSharePopover}>
                <i className="icon icon-20 icon-share" />
            </button>
            <a
                className="button button-pill button-outline-default"
                href={url}
                target="_blank"
                title="Visit website">
                <i className="icon icon-20 icon-external-link" />
            </a>
        </div>
    );
};

export default EntryActionList;
