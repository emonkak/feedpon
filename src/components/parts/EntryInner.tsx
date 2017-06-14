import React, { PureComponent } from 'react';
import classnames from 'classnames';

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
    fullContentIsShown: boolean;
}

export default class EntryInner extends PureComponent<EntryInnerProps, EntryInnerState> {
    constructor(props: EntryInnerProps, context: any) {
        super(props, context);

        this.state = {
            popover: 'none',
            fullContentIsShown: false
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
        const { fullContentIsShown } = this.state;

        if (!entry.fullContents.isLoading) {
            if (!fullContentIsShown) {
                const { onFetchFullContent } = this.props;

                if (!entry.fullContents.isLoaded) {
                    onFetchFullContent(entry.entryId, entry.url);
                }
            }

            this.setState({
                fullContentIsShown: !fullContentIsShown
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
        const { fullContentIsShown } = this.state;

        return (
            <nav className="entry-nav">
                <div className="button-toolbar">
                    <button
                        className={classnames('entry-action-pin button button-circular', entry.isPinned ? 'button-default' : 'button-outline-default')}
                        onClick={this.handleTogglePin}
                        disabled={entry.isPinning}>
                        <i className={classnames('icon icon-20', entry.isPinning ? 'icon-spinner icon-rotating' : 'icon-pin-3')} />
                    </button>
                    <button
                        className={classnames('entry-action-fetch-full-content button button-circular', fullContentIsShown ? 'button-default' : 'button-outline-default')}
                        onClick={this.handleToggleFullContent}
                        disabled={entry.fullContents.isLoading}>
                        <i className={classnames('icon icon-20', entry.fullContents.isLoading ? 'icon-spinner icon-rotating' : 'icon-page-overview')} />
                    </button>
                    <a className="entry-action-open-external-link button button-circular button-outline-default" href={entry.url} target="_blank">
                        <i className="icon icon-20 icon-external-link" />
                    </a>
                    <button className="entry-action-close button button-circular button-outline-default" onClick={onClose}>
                        <i className="icon icon-16 icon-close" />
                    </button>
                </div>
            </nav>
        );
    }

    renderBookmarks() {
        const { entry } = this.props;

        return (
            <div className="list-inline-item">
                <a
                    className={classnames('link-soft badge', {
                        'u-text-negative': entry.bookmarkCount > 0,
                        'badge-negative': entry.bookmarkCount >= 10
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
                <a className="link-strong" href={entry.origin.url} target="_blank">
                    {entry.origin.title}
                </a>
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
                <span>by {entry.author}</span>
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
                <RelativeTime time={entry.publishedAt} />
            </div>
        );
    }

    renderReadMarker() {
    }

    renderContent() {
        const { entry, entry: { fullContents } } = this.props;
        const { fullContentIsShown } = this.state;

        if (fullContentIsShown && fullContents.isLoaded) {
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
            <div className="button-toolbar u-text-center">
                <button
                    className={classnames('button button-circular', popover === 'comment' ? 'button-default' : 'button-outline-default')}
                    onClick={this.handleSwitchCommentPopover}>
                    <i className={classnames('icon icon-20', entry.comments.isLoading ? 'icon-spinner icon-rotating' : 'icon-comments')} />
                </button>
                <button
                    className={classnames('button button-circular', popover === 'share' ? 'button-default' : 'button-outline-default')}
                    onClick={this.handleSwitchSharePopover}>
                    <i className="icon icon-20 icon-share" />
                </button>
                <a
                    className="button button-circular button-outline-default"
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

        return (
            <div className="popover popover-default popover-bottom">
                <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
                <div className="popover-content">
                    <CommentList isLoading={entry.comments.isLoading} comments={entry.comments.items} />
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
                           href={'http://b.hatena.ne.jp/add?mode=confirm&title=' + encodeURIComponent(entry.title) + '&url=' + encodeURIComponent(entry.url)}>
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

        const readMaker = entry.markedAsRead
            ? <span className="badge badge-small badge-default">READ</span>
            : null;

        return (
            <div className="container" onClick={onExpand}>
                <header className="entry-header">
                    {this.renderNav()}
                    <h2 className="entry-title">
                        <a className="link-soft" target="_blank" href={entry.url} onClick={onExpand}>{entry.title}</a>
                        {readMaker}
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
