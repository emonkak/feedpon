import React, { PropTypes, PureComponent } from 'react';
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
    onFetchComments: (entryId: string, url: string) => void;
    onFetchFullContent: (entryId: string, url: string) => void;
}

interface EntryInnerState {
    popover: Popover;
    fullContentMode: boolean;
}

export default class EntryInner extends PureComponent<EntryInnerProps, EntryInnerState> {
    static propTypes = {
        entry: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onExpand: PropTypes.func.isRequired,
        onFetchComments: PropTypes.func.isRequired,
        onFetchFullContent: PropTypes.func.isRequired
    };

    constructor(props: EntryInnerProps, context: any) {
        super(props, context);

        this.state = {
            popover: 'none',
            fullContentMode: false
        };

        this.handleSwitchCommentPopover = this.handleSwitchCommentPopover.bind(this);
        this.handleSwitchSharePopover = this.handleSwitchSharePopover.bind(this);
        this.handleToggleFullContent = this.handleToggleFullContent.bind(this);
        this.handleFetchNextFullContent = this.handleFetchNextFullContent.bind(this);
    }

    handleSwitchCommentPopover(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        this.changePopover('comment');
    }

    handleSwitchSharePopover(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        this.changePopover('share');
    }

    handleToggleFullContent(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { entry } = this.props;
        const { fullContentMode } = this.state;

        if (!fullContentMode) {
            const { onFetchFullContent } = this.props;

            if (!entry.fullContents.isLoaded) {
                onFetchFullContent(entry.entryId, entry.url);
            }
        }

        this.setState({
            fullContentMode: !fullContentMode
        });
    }

    handleFetchNextFullContent() {
        const { entry, onFetchFullContent } = this.props;

        if (entry.fullContents.isLoaded && entry.fullContents.nextPageUrl) {
            onFetchFullContent(entry.entryId, entry.fullContents.nextPageUrl);
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
        const { fullContentMode } = this.state;

        return (
            <nav className="entry-nav">
                <a className={classnames('entry-action entry-action-fetch-full-content', { 'is-selected': fullContentMode })} href="#" onClick={this.handleToggleFullContent}>
                    <i className={classnames('icon', 'icon-20', entry.fullContents.isLoading ? 'icon-spinner animation-clockwise-rotation' : 'icon-page-overview')} />
                </a>
                <a className="entry-action entry-action-pin" href="#">
                    <i className="icon icon-20 icon-pin-3" />
                </a>
                <a className="entry-action entry-action-open-external-link" href={entry.url} target="_blank">
                    <i className="icon icon-20 icon-external-link" />
                </a>
                <a className="entry-action entry-action-close" href="#" onClick={onClose}>
                    <i className="icon icon-16 icon-close" />
                </a>
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
            <a
                className={classnames('entry-info', 'entry-info-bookmarks', {
                    'is-bookmarked': entry.bookmarkCount > 0,
                    'is-popular': entry.bookmarkCount >= 10,
                    'is-very-popular': entry.bookmarkCount >= 20
                })}
                target="_blank"
                href={entry.bookmarkUrl}>
                <i className="icon icon-16 icon-bookmark" />{entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
            </a>
        );
    }

    renderOrign() {
        const { entry } = this.props;

        if (entry.origin) {  // FIXME: If same origin
            return (
                <a
                    className="entry-info entry-info-origin"
                    target="_blank"
                    href={entry.origin.url}>
                    {entry.origin.title}
                </a>
            );
        }

        return null;
    }

    renderAuthor() {
        const { entry } = this.props;

        if (entry.author) {
            return (
                <span className="entry-info entry-info-author">by {entry.author}</span>
            );
        }

        return null;
    }

    renderPublishedAt() {
        const { entry } = this.props;

        if (entry.publishedAt) {
            return (
                <span className="entry-info entry-info-published-at">
                    <RelativeTime time={entry.publishedAt} />
                </span>
            );
        }

        return null;
    }

    renderContent() {
        const { entry, entry: { fullContents } } = this.props;
        const { fullContentMode } = this.state;

        if (fullContentMode && fullContents.isLoaded) {
            return (
                <FullContents
                    isLoading={fullContents.isLoading}
                    items={fullContents.items}
                    nextPageUrl={fullContents.nextPageUrl}
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
                <a
                    className={classnames('entry-action', { 'is-selected': popover === 'comment' })}
                    href="#"
                    onClick={this.handleSwitchCommentPopover}>
                    <i className="icon icon-20 icon-comments" />
                </a>
                <a
                    className={classnames('entry-action', { 'is-selected': popover === 'share' })}
                    href="#"
                    onClick={this.handleSwitchSharePopover}>
                    <i className="icon icon-20 icon-share" />
                </a>
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
                    <div className="entry-info-list">
                        {this.renderBookmarks()}
                        {this.renderOrign()}
                        {this.renderAuthor()}
                        {this.renderPublishedAt()}
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
