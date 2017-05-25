import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Link } from 'react-router';

import CleanHtml from 'components/parts/CleanHtml';
import CommentList from 'components/parts/CommentList';
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
    sameOrigin: boolean;
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
                    className={classnames('entry-action entry-action-pin', { 'is-selected': entry.isPinned })}
                    onClick={this.handleTogglePin}
                    disabled={entry.isPinning}>
                    <i className={classnames('icon icon-20', entry.isPinning ? 'icon-spinner animation-clockwise-rotation' : 'icon-pin-3')} />
                </button>
                <button
                    className={classnames('entry-action entry-action-fetch-full-content', { 'is-selected': fullContent })}
                    onClick={this.handleToggleFullContent}
                    disabled={entry.fullContents.isLoading}>
                    <i className={classnames('icon icon-20', entry.fullContents.isLoading ? 'icon-spinner animation-clockwise-rotation' : 'icon-page-overview')} />
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

    renderBookmarks() {
        const { entry } = this.props;

        return (
            <div className="list-inline-item">
                <a
                    className={classnames('entry-bookmarks', 'link-soft', {
                        'is-bookmarked': entry.bookmarkCount > 0,
                        'is-popular': entry.bookmarkCount >= 10
                    })}
                    target="_blank"
                    href={'http://b.hatena.ne.jp/entry/' + encodeURIComponent(entry.url)}>
                        <i className="icon icon-16 icon-bookmark" />{entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
                </a>
            </div>
        );
    }

    renderOrign() {
        const { entry, sameOrigin } = this.props;

        if (sameOrigin || !entry.origin) {
            return null;
        }

        return (
            <div className="list-inline-item">
                <Link className="link-strong"
                        to={'streams/' + encodeURIComponent(entry.origin.streamId)}>
                    {entry.origin.title}
                </Link>
            </div>
        );
    }

    renderAuthor() {
        const { entry } = this.props;

        if (!entry.author) {
            return null;
        }

        return (
            <div className="list-inline-item">
                <span className="entry-author">by {entry.author}</span>
            </div>
        );
    }

    renderPublishedAt() {
        const { entry } = this.props;

        if (!entry.publishedAt) {
            return null;
        }

        return (
            <div className="list-inline-item">
                <RelativeTime className="entry-published-at" time={entry.publishedAt} />
            </div>
        );
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
                    <i className={classnames('icon icon-20', entry.comments.isLoading ? 'icon-spinner animation-clockwise-rotation' : 'icon-comments')} />
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
            case 'comment': 
                return this.renderCommentPopover();

            case 'share':
                return this.renderSharePopover();

            default:
                return null;
        }
    }

    renderCommentPopover() {
        const { entry } = this.props;

        if (!entry.comments.isLoaded) {
            return null;
        }

        return (
            <div className="popover popover-default popover-bottom">
                <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
                <div className="popover-content">
                    <CommentList comments={entry.comments.items} />
                </div>
            </div>
        );
    }

    renderSharePopover() {
        const { entry } = this.props;

        return (
            <div className="popover popover-default popover-bottom">
                <div className="popover-arrow" style={{ left: '50%' }} />
                <div className="popover-content">
                    <div className="social-button-list">
                        <a className="social-button link-soft"
                           target="_blank"
                           title="Share to Twitter"
                           href={'https://twitter.com/intent/tweet?text=' + encodeURIComponent(entry.title + ' ' + entry.url)}>
                            <i className="icon icon-24 icon-twitter" />
                        </a>
                        <a className="social-button link-soft"
                           target="_blank"
                           title="Share to Facebook"
                           href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(entry.url)}>
                            <i className="icon icon-24 icon-facebook" />
                        </a>
                        <a className="social-button link-soft"
                           target="_blank"
                           title="Save to Hatena Bookmark"
                           href={'http://b.hatena.ne.jp/entry/' + encodeURIComponent(entry.url)}>
                            <i className="icon icon-24 icon-hatena-bookmark" />
                        </a>
                        <a className="social-button link-soft"
                           target="_blank"
                           title="Save to Pocket"
                           href={'https://getpocket.com/save?url=' + encodeURIComponent(entry.url) + "&title=" + encodeURIComponent(entry.title)}>
                            <i className="icon icon-24 icon-pocket" />
                        </a>
                        <a className="social-button link-soft"
                           target="_blank"
                           title="Save to Instapaper"
                           href={'http://www.instapaper.com/text?u=' + encodeURIComponent(entry.url)}>
                            <i className="icon icon-24 icon-instapaper" />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const { entry, onExpand } = this.props;

        return (
            <div className="container" onClick={onExpand}>
                <header className="entry-header">
                    {this.renderNav()}
                    <h2 className="entry-title">
                        <a target="_blank" href={entry.url} onClick={onExpand}>{entry.title}</a>
                    </h2>
                    <div className="u-text-muted">
                        <div className="list-inline list-inline-dotted">
                            {this.renderBookmarks()}
                            {this.renderOrign()}
                            {this.renderAuthor()}
                            {this.renderPublishedAt()}
                        </div>
                    </div>
                </header>
                {this.renderContent()}
                <div className="entry-summary">{entry.summary}</div>
                <footer className="entry-footer">
                    {this.renderActionList()}
                    {this.renderPopover()}
                </footer>
            </div>
        );
    }
}
