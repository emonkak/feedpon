import React from 'react';
import classnames from 'classnames';

interface EntryNavProps {
    fullContentsIsLoading: boolean;
    fullContentsIsShown: boolean;
    isPinned: boolean;
    isPinning: boolean;
    onClose: React.MouseEventHandler<any>;
    onToggleFullContent: React.MouseEventHandler<any>;
    onTogglePin: React.MouseEventHandler<any>;
    url: string;
}

const EntryNav: React.SFC<EntryNavProps> = ({
    fullContentsIsLoading,
    fullContentsIsShown,
    isPinned,
    isPinning,
    onClose,
    onToggleFullContent,
    onTogglePin,
    url 
}) => {
    return (
        <nav className="entry-nav">
            <div className="button-toolbar">
                <button
                    className={classnames('entry-action-pin button button-pill', isPinned ? 'button-default' : 'button-outline-default')}
                    title="Pin"
                    onClick={onTogglePin}
                    disabled={isPinning}>
                    <i className={classnames('icon icon-20', isPinning ? 'icon-spinner icon-rotating' : 'icon-pin-3')} />
                </button>
                <button
                    className={classnames('entry-action-fetch-full-content button button-pill', fullContentsIsShown ? 'button-default' : 'button-outline-default')}
                    title="Fetch full content"
                    onClick={onToggleFullContent}
                    disabled={fullContentsIsLoading}>
                    <i className={classnames('icon icon-20', fullContentsIsLoading ? 'icon-spinner icon-rotating' : 'icon-page-overview')} />
                </button>
                <a
                    className="entry-action-visit-website button button-pill button-outline-default"
                    href={url}
                    title="Visit website"
                    target="_blank">
                    <i className="icon icon-20 icon-external-link" />
                </a>
                <button
                    className="entry-action-close button button-pill button-outline-default"
                    title="Close"
                    onClick={onClose}>
                    <i className="icon icon-16 icon-close" />
                </button>
            </div>
        </nav>
    );
};

export default EntryNav;
