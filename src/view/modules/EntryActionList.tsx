import React from 'react';
import classnames from 'classnames';

import EntryShareButton from 'view/modules/EntryShareButton';

interface EntryActionListProps {
    commentsIsLoading: boolean;
    commentsIsShown: boolean;
    onToggleComments: React.MouseEventHandler<any>;
    title: string;
    url: string;
}

const EntryActionList: React.SFC<EntryActionListProps> = ({
    commentsIsLoading,
    commentsIsShown,
    onToggleComments,
    title,
    url
}) => {
    return (
        <div className="button-toolbar u-flex u-flex-align-items-center u-flex-justify-content-center">
            <button
                className={classnames('button button-pill', commentsIsShown ? 'button-default' : 'button-outline-default')}
                title="Comments..."
                onClick={onToggleComments}>
                <i className={classnames('icon icon-20', commentsIsLoading ? 'icon-spinner animation-rotating' : 'icon-comments')} />
            </button>
            <EntryShareButton url={url} title={title} />
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
