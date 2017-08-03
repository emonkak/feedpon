import React from 'react';
import classnames from 'classnames';

import CleanHtml from 'components/widgets/CleanHtml';
import CommentPopover from 'components/parts/CommentPopover';
import EntryActionList from 'components/parts/EntryActionList';
import EntryNav from 'components/parts/EntryNav';
import FullContents from 'components/parts/FullContents';
import RelativeTime from 'components/widgets/RelativeTime';
import { Entry } from 'messaging/types';

interface EntryInnerProps {
    entry: Entry;
    onExpand: React.MouseEventHandler<any>;
    onFetchNextFullContent: React.MouseEventHandler<any>;
    onToggleComments: React.MouseEventHandler<any>;
    onToggleFullContent: React.MouseEventHandler<any>;
    onTogglePin: React.MouseEventHandler<any>;
    sameOrigin: boolean;
}

const EntryInner: React.SFC<EntryInnerProps> = ({
    entry,
    onExpand,
    onFetchNextFullContent,
    onToggleComments,
    onToggleFullContent,
    onTogglePin,
    sameOrigin
}) => {
    const readMaker = entry.markedAsRead
        ? <span className="badge badge-small badge-default">READ</span>
        : null;

    const contents = entry.fullContents.isShown && entry.fullContents.isLoaded
        ? <FullContents
            isLoading={entry.fullContents.isLoading}
            items={entry.fullContents.items}
            onFetchNext={onFetchNextFullContent} />
        : <CleanHtml
            baseUrl={entry.url}
            className="entry-content u-clearfix"
            html={entry.content} />;

    return (
        <div className="container" onClick={onExpand}>
            <header className="entry-header">
                <EntryNav
                    fullContentsIsLoading={entry.fullContents.isLoading}
                    fullContentsIsShown={entry.fullContents.isShown}
                    isPinned={entry.isPinned}
                    isPinning={entry.isPinning}
                    onToggleFullContent={onToggleFullContent}
                    onTogglePin={onTogglePin}
                    url={entry.url} />
                <h2 className="entry-title">
                    <a className="link-soft" target="_blank" href={entry.url} onClick={onExpand}>{entry.title}</a>
                    {readMaker}
                </h2>
                <div className="u-text-muted">
                    <ul className="list-inline list-inline-dotted">
                        {renderBookmarks(entry)}
                        {renderOrign(entry, sameOrigin)}
                        {renderAuthor(entry)}
                        {renderPublishedAt(entry)}
                    </ul>
                </div>
            </header>
            {contents}
            <div className="entry-summary">{entry.summary}</div>
            <footer className="entry-footer">
                <EntryActionList
                    commentsIsLoading={entry.comments.isLoading}
                    commentsIsShown={entry.comments.isShown}
                    onToggleComments={onToggleComments}
                    title={entry.title}
                    url={entry.url} />
                {entry.comments.isShown &&
                    <CommentPopover
                        arrowOffset={-44}
                        isLoading={entry.comments.isLoading}
                        comments={entry.comments.items} />}
            </footer>
        </div>
    );
}

function renderBookmarks(entry: Entry) {
    return (
        <li className="list-inline-item">
            <a
                className={classnames('link-soft badge', {
                    'u-text-negative': entry.bookmarkCount > 0,
                    'badge-negative': entry.bookmarkCount >= 10
                })}
                target="_blank"
                href={'http://b.hatena.ne.jp/entry/' + encodeURIComponent(entry.url)}>
                    <i className="icon icon-16 icon-bookmark" />
                    {entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
            </a>
        </li>
    );
}

function renderOrign(entry: Entry, sameOrigin: boolean) {
    if (sameOrigin || !entry.origin) {
        return null;
    }

    return (
        <li className="list-inline-item">
            <a className="link-strong" href={entry.origin.url} target="_blank">
                {entry.origin.title}
            </a>
        </li>
    );
}

function renderAuthor(entry: Entry) {
    if (!entry.author) {
        return null;
    }

    return (
        <li className="list-inline-item">
            <span>by {entry.author}</span>
        </li>
    );
}

function renderPublishedAt(entry: Entry) {
    if (!entry.publishedAt) {
        return null;
    }

    return (
        <li className="list-inline-item">
            <RelativeTime time={entry.publishedAt} />
        </li>
    );
}

export default EntryInner;
