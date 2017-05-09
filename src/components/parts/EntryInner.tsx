import React, { PureComponent } from 'react';
import classnames from 'classnames';

import CleanHtml from 'components/parts/CleanHtml';
import CommentPopoverContent from 'components/parts/CommentPopoverContent';
import FullContents from 'components/parts/FullContents';
import RelativeTime from 'components/parts/RelativeTime';
import { Entry } from 'messaging/types';

type Popover = 'none' | 'comment' | 'share';

interface EntryInnerProps {
    entry: Entry;
    onClose: (event: React.SyntheticEvent<any>) => void;
    onExpand: (event: React.SyntheticEvent<any>) => void;
    onFetchComments: (entryId: string | number, url: string) => void;
    onFetchFullContent: (entryId: string | number, url: string) => void;
    onPin: (entryId: string | number) => void;
    onUnpin: (entryId: string | number) => void;
}

interface EntryInnerState {
    popover: Popover;
    fullContent: boolean;
}

export default class EntryInner extends PureComponent<EntryInnerProps, EntryInnerState> {
    constructor(props: EntryInnerProps, context: any) {
        super(props, context);

        this.state = {
            popover: 'none',
            fullContent: false
        };

        this.handleFetchNextFullContent = this.handleFetchNextFullContent.bind(this);
        this.handleSwitchCommentPopover = this.handleSwitchCommentPopover.bind(this);
        this.handleSwitchSharePopover = this.handleSwitchSharePopover.bind(this);
        this.handleToggleFullContent = this.handleToggleFullContent.bind(this);
        this.handleTogglePin = this.handleTogglePin.bind(this);
    }

    handleFetchNextFullContent() {
        const { entry, onFetchFullContent } = this.props;

        if (entry.fullContents.isLoaded) {
            const latestFullContent = entry.fullContents.items[entry.fullContents.items.length - 1];

            if (latestFullContent && latestFullContent.nextPageUrl) {
                onFetchFullContent(entry.entryId, latestFullContent.nextPageUrl);
            }
        }
    }

    handleSwitchCommentPopover(event: React.SyntheticEvent<any>) {
        this.changePopover('comment');
    }

    handleSwitchSharePopover(event: React.SyntheticEvent<any>) {
        this.changePopover('share');
    }

    handleToggleFullContent(event: React.SyntheticEvent<any>) {
        const { entry } = this.props;
        const { fullContent } = this.state;

        if (!entry.fullContents.isLoading) {
            if (!fullContent) {
                const { onFetchFullContent } = this.props;

                if (!entry.fullContents.isLoaded) {
                    onFetchFullContent(entry.entryId, entry.url);
                }
            }

            this.setState({
                fullContent: !fullContent
            });
        }
    }

    handleTogglePin(event: React.SyntheticEvent<any>) {
        const { entry, onPin, onUnpin } = this.props;

        if (!entry.isPinning) {
            if (entry.isPinned) {
                onUnpin(entry.entryId);
            } else {
                onPin(entry.entryId);
            }
        }
    }

    changePopover(nextPopover: Popover) {
        const { popover } = this.state;

        if (popover === nextPopover) {
            this.setState({ popover: 'none' });
        } else {
            if (nextPopover === 'comment') {
                const { entry, onFetchComments } = this.props;

                if (!entry.comments.isLoaded) {
                    onFetchComments(entry.entryId, entry.url);
                }
            }

            this.setState({ popover: nextPopover });
        }
    }

    renderNav() {
        const { entry, onClose } = this.props;
        const { fullContent } = this.state;

        return (
            <nav className="entry-nav">
                <button
                    className={classnames('entry-action entry-action-fetch-full-content', { 'is-selected': fullContent })}
                    onClick={this.handleToggleFullContent}
                    disabled={entry.fullContents.isLoading}>
                    <i className={classnames('icon icon-20', entry.fullContents.isLoading ? 'icon-spinner animation-clockwise-rotation' : 'icon-page-overview')} />
                </button>
                <button
                    className={classnames('entry-action entry-action-pin', { 'is-selected': entry.isPinned })}
                    onClick={this.handleTogglePin}
                    disabled={entry.isPinning}>
                    <i className={classnames('icon icon-20', entry.isPinning ? 'icon-spinner animation-clockwise-rotation' : 'icon-pin-3')} />
                </button>
                <a className="entry-action entry-action-open-external-link" href={entry.url} target="_blank">
                    <i className="icon icon-20 icon-external-link" />
                </a>
                <button className="entry-action entry-action-close" onClick={onClose}>
                    <i className="icon icon-16 icon-close" />
                </button>
            </nav>
        );
    }

    renderTitle() {
        const { entry, onExpand } = this.props;

        return (
            <h2 className="entry-title">
                <a target="_blank" href={entry.url} onClick={onExpand}>{entry.title}</a>
            </h2>
        );
    }

    renderBookmarks() {
        const { entry } = this.props;

        return (
            <div className="list-inline-item">
                <a
                    className={classnames('entry-bookmarks', 'link-default', {
                        'is-bookmarked': entry.bookmarkCount > 0,
                        'is-popular': entry.bookmarkCount >= 10,
                        'is-very-popular': entry.bookmarkCount >= 20
                    })}
                    target="_blank"
                    href={entry.bookmarkUrl}>
                        <i className="icon icon-16 icon-bookmark" />{entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
                </a>
            </div>
        );
    }

    renderOrign() {
        const { entry } = this.props;

        if (entry.origin) {  // FIXME: If same origin
            return (
                <div className="list-inline-item">
                    <a
                        className="entry-origin link-default"
                        target="_blank"
                        href={entry.origin.url}>
                        {entry.origin.title}
                    </a>
                </div>
            );
        }

        return null;
    }

    renderAuthor() {
        const { entry } = this.props;

        if (entry.author) {
            return (
                <div className="list-inline-item">
                    <span className="entry-author">by {entry.author}</span>
                </div>
            );
        }

        return null;
    }

    renderPublishedAt() {
        const { entry } = this.props;

        if (entry.publishedAt) {
            return (
                <div className="list-inline-item">
                    <RelativeTime className="entry-published-at" time={entry.publishedAt} />
                </div>
            );
        }

        return null;
    }

    renderContent() {
        const { entry, entry: { fullContents } } = this.props;
        const { fullContent } = this.state;

        if (fullContent && fullContents.isLoaded) {
            return (
                <FullContents
                    isLoading={fullContents.isLoading}
                    items={fullContents.items}
                    onFetchNext={this.handleFetchNextFullContent} />
            );
        } else {
            return (
                <CleanHtml
                    baseUrl={entry.url}
                    className="entry-content"
                    html={entry.content} />
            );
        }
    }

    renderActionList() {
        const { entry } = this.props;
        const { popover } = this.state;

        return (
            <div className="entry-action-list">
                <button
                    className={classnames('entry-action', { 'is-selected': popover === 'comment' })}
                    onClick={this.handleSwitchCommentPopover}>
                    <i className="icon icon-20 icon-comments" />
                </button>
                <button
                    className={classnames('entry-action', { 'is-selected': popover === 'share' })}
                    onClick={this.handleSwitchSharePopover}>
                    <i className="icon icon-20 icon-share" />
                </button>
                <a
                    className="entry-action"
                    href={entry.url}
                    target="_blank">
                    <i className="icon icon-20 icon-external-link" />
                </a>
            </div>
        );
    }

    renderPopover() {
        const { popover } = this.state;

        switch (popover) {
            case 'comment': {
                const { entry } = this.props;

                return (
                    <div className="popover popover-default popover-bottom">
                        <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
                        <CommentPopoverContent comments={entry.comments} />
                    </div>
                );
            }

            case 'share':
                return (
                    <div className="popover popover-default popover-bottom">
                        <div className="popover-arrow" style={{ left: '50%' }} />
                        <div className="popover-content">Share...</div>
                    </div>
                );

            default:
                return null;
        }
    }

    render() {
        const { entry } = this.props;

        return (
            <div className="container">
                <header className="entry-header">
                    {this.renderNav()}
                    {this.renderTitle()}
                    <div className="entry-metadata">
                        <div className="list-inline list-inline-dotted">
                            {this.renderBookmarks()}
                            {this.renderOrign()}
                            {this.renderAuthor()}
                            {this.renderPublishedAt()}
                        </div>
                    </div>
                </header>
                <div className="entry-summary">{entry.summary}</div>
                {this.renderContent()}
                <footer className="entry-footer">
                    {this.renderActionList()}
                    {this.renderPopover()}
                </footer>
            </div>
        );
    }
}
