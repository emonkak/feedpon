import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import RelativeTime from 'components/parts/RelativeTime';
import SanitizeHtml from 'components/parts/SanitizeHtml';
import StripHtml from 'components/parts/StripHtml';

export default class Entry extends PureComponent<any, any> {
    static propTypes = {
        entry: PropTypes.shape({
            author: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            entryId: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            isRead: PropTypes.string,
            publishedAt: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
            origin: PropTypes.shape({
                feedId: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
            })
        }),
        isActive: PropTypes.bool.isRequired,
        isCollapsible: PropTypes.bool.isRequired,
        isExpanded: PropTypes.bool.isRequired,
        handleClickTitle: PropTypes.func,
        onClose: PropTypes.func
    };

    static defaultProps = {
        isActive: false,
        isCollapsible: false,
        isExpanded: false
    };

    constructor(props: any, context: any) {
        super(props, context);

        this.handleClose = this.handleClose.bind(this);
        this.handleCollapse = this.handleCollapse.bind(this);
    }

    handleCollapse(event: React.SyntheticEvent<any>) {
        const { isCollapsible, isExpanded, onCollapse } = this.props;

        if (onCollapse && isCollapsible && !isExpanded) {
            event.preventDefault();

            onCollapse(findDOMNode(this));
        }
    }

    handleClose(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isCollapsible, isExpanded, onClose } = this.props;

        if (onClose && isCollapsible && isExpanded) {
            onClose();
        }
    }

    render() {
        const { entry, isActive, isCollapsible, isExpanded } = this.props;

        return (
            <article
                id={'entry--' + entry.entryId}
                className={classnames('entry', {
                    'is-active': isActive,
                    'is-collapsible': isCollapsible,
                    'is-expanded': isExpanded,
                    'is-unread': !entry.readAt
                })}>
                <EntryInner
                    entry={entry}
                    onClose={this.handleClose}
                    onCollapse={this.handleCollapse} />
            </article>
        );
    }
}

class EntryInner extends PureComponent<any, any> {
    static propTypes = {
        entry: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onCollapse: PropTypes.func.isRequired
    };

    renderBookmarks() {
        const { entry } = this.props;

        const urlPrefix = 'http://b.hatena.ne.jp/entry/';

        return (
            <a
                className={classnames('entry-info', 'entry-info-bookmarks', {
                    'is-bookmarked': entry.bookmarks > 0,
                    'is-popular': entry.bookmarks >= 10,
                    'is-very-popular': entry.bookmarks >= 20
                })}
                target="_blank"
                href={urlPrefix + entry.url}>
                <i className="icon icon-align-bottom icon-16 icon-bookmark" />{entry.bookmarks}
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
                    <strong>{entry.origin.title}</strong>
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

    render() {
        const { entry, onClose, onCollapse } = this.props;

        return (
            <div className="container">
                <header className="entry-header">
                    <nav className="entry-nav">
                        <a className="entry-action" href="#"><i className="icon icon-20 icon-new-document"></i></a>
                        <a className="entry-action" href="#"><i className="icon icon-20 icon-pin-3"></i></a>
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
                <StripHtml className="entry-description" html={entry.description} />
                <SanitizeHtml className="entry-content" html={entry.content} />
                <footer className="entry-footer">
                    <a className="entry-action" href="#"><i className="icon icon-20 icon-bookmark"></i></a>
                    <a className="entry-action" href="#"><i className="icon icon-20 icon-external-link"></i></a>
                    <a className="entry-action" href="#"><i className="icon icon-20 icon-share"></i></a>
                </footer>
            </div>
        );
    }
}
