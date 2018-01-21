import React from 'react';
import classnames from 'classnames';

interface EntryNavProps {
    fullContentsIsLoading: boolean;
    fullContentsIsShown: boolean;
    isPinned: boolean;
    isPinning: boolean;
    onToggleFullContent: React.MouseEventHandler<any>;
    onTogglePin: React.MouseEventHandler<any>;
    url: string;
}

const EntryNav: React.SFC<EntryNavProps> = ({
    fullContentsIsLoading,
    fullContentsIsShown,
    isPinned,
    isPinning,
    onToggleFullContent,
    onTogglePin,
    url
}) => {
    return (
        <nav className="entry-nav">
            <div className="button-toolbar">
                <button
                    className={classnames('button button-pill', isPinned ? 'button-default' : 'button-outline-default')}
                    title="Pin"
                    onClick={onTogglePin}
                    disabled={isPinning}>
                    <i className={classnames('icon icon-20', isPinning ? 'icon-spinner animation-rotating' : 'icon-pin-3')} />
                </button>
                <button
                    className={classnames('button button-pill', fullContentsIsShown ? 'button-default' : 'button-outline-default')}
                    title="Fetch full content"
                    onClick={onToggleFullContent}
                    disabled={fullContentsIsLoading}>
                    <i className={classnames('icon icon-20', fullContentsIsLoading ? 'icon-spinner animation-rotating' : 'icon-page-overview')} />
                </button>
            </div>
        </nav>
    );
};

export default EntryNav;
