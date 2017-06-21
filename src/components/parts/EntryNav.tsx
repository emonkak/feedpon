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

const EntryNav: React.SFC<EntryNavProps> = (props) => {
    const { fullContentsIsLoading, fullContentsIsShown, isPinned, isPinning, onClose, onToggleFullContent, onTogglePin, url } = props;

    return (
        <nav className="entry-nav">
            <div className="button-toolbar">
                <button
                    className={classnames('entry-action-pin button button-circular', isPinned ? 'button-default' : 'button-outline-default')}
                    onClick={onTogglePin}
                    disabled={isPinning}>
                    <i className={classnames('icon icon-20', isPinning ? 'icon-spinner icon-rotating' : 'icon-pin-3')} />
                </button>
                <button
                    className={classnames('entry-action-fetch-full-content button button-circular', fullContentsIsShown ? 'button-default' : 'button-outline-default')}
                    onClick={onToggleFullContent}
                    disabled={fullContentsIsLoading}>
                    <i className={classnames('icon icon-20', fullContentsIsLoading ? 'icon-spinner icon-rotating' : 'icon-page-overview')} />
                </button>
                <a className="entry-action-open-external-link button button-circular button-outline-default" href={url} target="_blank">
                    <i className="icon icon-20 icon-external-link" />
                </a>
                <button className="entry-action-close button button-circular button-outline-default" onClick={onClose}>
                    <i className="icon icon-16 icon-close" />
                </button>
            </div>
        </nav>
    );
};

export default EntryNav;
