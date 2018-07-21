import React, { PureComponent } from 'react';
import classnames from 'classnames';

import CleanHtml from 'view/components/CleanHtml';
import CommentPopover from 'view/modules/CommentPopover';
import EntryActionList from 'view/modules/EntryActionList';
import EntryNav from 'view/modules/EntryNav';
import FullContents from 'view/modules/FullContents';
import RelativeTime from 'view/components/RelativeTime';
import { Entry } from 'messaging/types';

interface EntryProps {
    entry: Entry;
    index: number;
    isActive: boolean;
    isExpanded: boolean;
    onExpand: (index: number) => void;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onHideComments: (entryId: string | number) => void;
    onHideFullContents: (entryId: string | number) => void;
    onPin: (entryId: string | number) => void;
    onShowComments: (entryId: string | number) => void;
    onShowFullContents: (entryId: string | number) => void;
    onUnpin: (entryId: string | number) => void;
    sameOrigin: boolean;
}

interface ExpandedEntryContentProps {
    entry: Entry;
    onFetchNextFullContent: React.MouseEventHandler<any>;
    onToggleComments: React.MouseEventHandler<any>;
    onToggleFullContent: React.MouseEventHandler<any>;
    onTogglePin: React.MouseEventHandler<any>;
    sameOrigin: boolean;
}

interface CollapsedEntryContentProps {
    entry: Entry;
    sameOrigin: boolean;
}

export default class EntryComponent extends PureComponent<EntryProps> {
    render() {
        const { entry, isActive, isExpanded } = this.props;

        return (
            <article
                className={classnames('entry', {
                    'is-active': isActive,
                    'is-expanded': isExpanded,
                    'is-marked-as-read': entry.markedAsRead,
                    'is-pinned': entry.isPinned
                })}
                onClick={this._handleExpand}>
                {this._renderContent()}
            </article>
        );
    }

    private _renderContent() {
        const { entry, isExpanded, sameOrigin } = this.props;

        if (isExpanded) {
            return (
                <ExpandedEntryContent
                    entry={entry}
                    onFetchNextFullContent={this._handleFetchNextFullContent}
                    onToggleComments={this._handleToggleComments}
                    onToggleFullContent={this._handleToggleFullContent}
                    onTogglePin={this._handleTogglePin}
                    sameOrigin={sameOrigin} />
            );
        } else {
            return (
                <CollapsedEntryContent
                    entry={entry}
                    sameOrigin={sameOrigin} />
            );
        }
    }

    private _handleExpand = (event: React.MouseEvent<any>) => {
        const { index, isExpanded, onExpand } = this.props;

        if (!isExpanded) {
            const target = event.target as HTMLElement;

            if (target === event.currentTarget
                || (!target.closest('a') && !target.closest('button'))) {
                event.preventDefault();

                onExpand(index);
            }
        }
    }

    private _handleFetchNextFullContent = () => {
        const { entry, onFetchFullContent } = this.props;

        if (entry.fullContents.isLoaded) {
            const lastFullContent = entry.fullContents.items[entry.fullContents.items.length - 1];

            if (lastFullContent && lastFullContent.nextPageUrl) {
                onFetchFullContent(entry.entryId, lastFullContent.nextPageUrl);
            }
        }
    }

    private _handleToggleComments = (event: React.MouseEvent<any>) => {
        const { entry, onFetchComments, onHideComments, onShowComments } = this.props;

        if (entry.comments.isLoaded) {
            if (entry.comments.isShown) {
                onHideComments(entry.entryId);
            } else {
                onShowComments(entry.entryId);
            }
        } else {
            onFetchComments(entry.entryId, entry.url);
        }
    }

    private _handleToggleFullContent = (event: React.MouseEvent<any>) => {
        const { entry, onFetchFullContent, onHideFullContents, onShowFullContents } = this.props;

        if (!entry.fullContents.isLoading) {
            if (!entry.fullContents.isLoaded) {
                onFetchFullContent(entry.entryId, entry.url);
            }

            if (entry.fullContents.isShown) {
                onHideFullContents(entry.entryId);
            } else {
                onShowFullContents(entry.entryId);
            }
        }
    }

    private _handleTogglePin = (event: React.MouseEvent<any>) => {
        const { entry, onPin, onUnpin } = this.props;

        if (!entry.isPinning) {
            if (entry.isPinned) {
                onUnpin(entry.entryId);
            } else {
                onPin(entry.entryId);
            }
        }
    }
}

const ExpandedEntryContent: React.SFC<ExpandedEntryContentProps> = ({
    entry,
    onFetchNextFullContent,
    onToggleComments,
    onToggleFullContent,
    onTogglePin,
    sameOrigin
}) => {
    const content = entry.fullContents.isShown && entry.fullContents.isLoaded
        ? <FullContents
            isLoading={entry.fullContents.isLoading}
            isNotFound={entry.fullContents.isNotFound}
            items={entry.fullContents.items}
            onFetchNext={onFetchNextFullContent} />
        : <CleanHtml
            baseUrl={entry.url}
            className="entry-content u-clearfix u-text-wrap"
            html={entry.content} />;

    return (
        <div className="container">
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
                    <a className="link-soft" target="_blank" href={entry.url}>{entry.title || 'No Title'}</a>
                    {renderReadMarker(entry)}
                </h2>
                <div className="entry-metadata">
                    <ul className="list-inline list-inline-dotted">
                        {renderBookmarks(entry)}
                        {renderOrign(entry, sameOrigin)}
                        {renderAuthor(entry)}
                        {renderPublishedAt(entry)}
                    </ul>
                </div>
            </header>
            {content}
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
};

const CollapsedEntryContent: React.SFC<CollapsedEntryContentProps> = ({
    entry,
    sameOrigin
}) => {
    return (
        <div className="container">
            <header className="entry-header">
                <h2 className="entry-title">
                    <a className="link-soft" target="_blank" href={entry.url}>{entry.title || 'No Title'}</a>
                    {renderReadMarker(entry)}
                </h2>
                <div className="entry-metadata">
                    <ul className="list-inline list-inline-dotted">
                        {renderBookmarks(entry)}
                        {renderOrign(entry, sameOrigin)}
                        {renderAuthor(entry)}
                        {renderPublishedAt(entry)}
                    </ul>
                </div>
            </header>
            <div className="entry-summary">{entry.summary}</div>
        </div>
    );
};

function renderBookmarks(entry: Entry) {
    return (
        <li className="list-inline-item">
            <a
                className={classnames('link-soft badge badge-medium', {
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

function renderReadMarker(entry: Entry) {
    return entry.markedAsRead
        ? <span className="badge badge-small badge-default">READ</span>
        : null;
}
