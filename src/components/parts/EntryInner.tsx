import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import CleanHtml from 'components/parts/CleanHtml';
import Comment from 'components/parts/Comment';
import RelativeTime from 'components/parts/RelativeTime';
import StripTags from 'components/parts/StripTags';
import { Entry } from 'messaging/types';

type Popover = 'hidden' | 'comment' | 'share';

interface EntryInnerProps {
    entry: Entry;
    onClose: (event: React.SyntheticEvent<any>) => void;
    onCollapse: (event: React.SyntheticEvent<any>) => void;
    onFetchComments: () => void;
}

interface EntryInnerState {
    popover: Popover;
}

export default class EntryInner extends PureComponent<EntryInnerProps, EntryInnerState> {
    static propTypes = {
        entry: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onCollapse: PropTypes.func.isRequired,
        onFetchComments: PropTypes.func.isRequired
    };

    constructor(props: EntryInnerProps, context: any) {
        super(props, context);

        this.state = {
            popover: 'hidden'
        };
    }

    handleChangePopover(nextPopover: Popover, event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { popover } = this.state;

        if (popover === nextPopover) {
            this.setState({ popover: 'hidden' });
        } else {
            if (nextPopover === 'comment') {
                const { entry, onFetchComments } = this.props;

                if (!entry.comments.isLoaded) {
                    onFetchComments();
                }
            }

            this.setState({ popover: nextPopover });
        }
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
                <i className="icon icon-align-bottom icon-16 icon-bookmark" />{entry.bookmarkCount > 0 ? entry.bookmarkCount : ''}
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

    renderPopover() {
        const { popover } = this.state;

        switch (popover) {
            case 'comment': {
                const { entry } = this.props;

                if (!entry.comments.isLoaded) {
                    return (
                        <div className="popover popover-default popover-bottom">
                            <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
                            <div className="popover-content">
                                <div className="comment">
                                    <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                                    <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                                    <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                                </div>
                                <div className="comment">
                                    <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                                    <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                                    <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                                </div>
                                <div className="comment">
                                    <span className="comment-user"><span className="placeholder placeholder-animated placeholder-10" /></span>
                                    <span className="comment-comment"><span className="placeholder placeholder-animated placeholder-60" /></span>
                                    <span className="comment-timestamp"><span className="placeholder placeholder-animated placeholder-20" /></span>
                                </div>
                            </div>
                        </div>
                    );
                }

                const comments = entry.comments.items.length > 0
                    ? entry.comments.items.map(item => <Comment key={item.user} comment={item} />)
                    : 'There aren’t any comments.';

                return (
                    <div className="popover popover-default popover-bottom">
                        <div className="popover-arrow" style={{ left: 'calc(50% - 44px)' }} />
                        <div className="popover-content">{comments}</div>
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
        const { entry, onClose, onCollapse } = this.props;
        const { popover } = this.state;

        return (
            <div className="container">
                <header className="entry-header">
                    <nav className="entry-nav">
                        <a className="entry-action" href="#"><i className="icon icon-20 icon-pin-3"></i></a>
                        <a className="entry-action" href="#"><i className="icon icon-20 icon-new-document"></i></a>
                        <a className="entry-action entry-action-open" href={entry.url} target="_blank"><i className="icon icon-20 icon-external-link"></i></a>
                        <a className="entry-action entry-action-close" href="#" onClick={onClose}><i className="icon icon-16 icon-close"></i></a>
                    </nav>
                    <h2 className="entry-title">
                        <a
                            target="_blank"
                            href={entry.url}
                            onClick={onCollapse}>
                            {entry.title}
                        </a>
                    </h2>
                    <div className="entry-info-list">
                        {this.renderBookmarks()}
                        {this.renderOrign()}
                        {this.renderAuthor()}
                        {this.renderPublishedAt()}
                    </div>
                </header>
                <StripTags className="entry-summary" html={entry.summary} />
                <CleanHtml className="entry-content" html={entry.content} />
                <footer className="entry-footer">
                    <div className="entry-action-list">
                        <a
                            className={classnames('entry-action', { 'is-selected': popover === 'comment' })}
                            href="#"
                            onClick={this.handleChangePopover.bind(this, 'comment')}>
                            <i className="icon icon-20 icon-comments" />
                        </a>
                        <a
                            className={classnames('entry-action', { 'is-selected': popover === 'share' })}
                            href="#"
                            onClick={this.handleChangePopover.bind(this, 'share')}>
                            <i className="icon icon-20 icon-share" />
                        </a>
                        <a
                            className="entry-action"
                            href={entry.url}
                            target="_blank">
                            <i className="icon icon-20 icon-external-link" />
                        </a>
                    </div>
                    {this.renderPopover()}
                </footer>
            </div>
        );
    }
}
