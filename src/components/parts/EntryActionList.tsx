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

const EntryActionList: React.SFC<EntryActionListProps> = (props) => {
    const { commentsIsLoading, onSwitchCommentPopover, onSwitchSharePopover, popover, url } = props;

    return (
        <div className="button-toolbar u-text-center">
            <button
                className={classnames('button button-circular', popover === 'comment' ? 'button-default' : 'button-outline-default')}
                onClick={onSwitchCommentPopover}>
                <i className={classnames('icon icon-20', commentsIsLoading ? 'icon-spinner icon-rotating' : 'icon-comments')} />
            </button>
            <button
                className={classnames('button button-circular', popover === 'share' ? 'button-default' : 'button-outline-default')}
                onClick={onSwitchSharePopover}>
                <i className="icon icon-20 icon-share" />
            </button>
            <a
                className="button button-circular button-outline-default"
                href={url}
                target="_blank">
                <i className="icon icon-20 icon-external-link" />
            </a>
        </div>
    );
};

export default EntryActionList;
