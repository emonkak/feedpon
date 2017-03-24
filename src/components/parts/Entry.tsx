import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import RelativeTime from 'components/parts/RelativeTime';
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

    handleCollapse(event: React.SyntheticEvent<any>) {
        const { onCollapse, isCollapsible, isExpanded } = this.props;

        if (isCollapsible && !isExpanded && onCollapse) {
            event.preventDefault();

            onCollapse(findDOMNode(this));
        }
    }

    handleClose(event: React.SyntheticEvent<any>) {
        event.preventDefault();

        const { isCollapsible, isExpanded, onClose } = this.props;

        if (isCollapsible && isExpanded && onClose) {
            onClose();
        }
    }

    renderBookmarks() {
        const { entry } = this.props;

        const urlPrefix = 'http://b.hatena.ne.jp/entry/';

        return (
            <a
                className={classnames('entry-infobar-item', 'entry-infobar-bookmarks', {
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
                    className="entry-infobar-item entry-infobar-origin"
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
                <span className="entry-infobar-item entry-infobar-author">by {entry.author}</span>
            );
        }

        return null;
    }

    renderPublishedAt() {
        const { entry } = this.props;

        if (entry.publishedAt) {
            return (
                <span className="entry-infobar-item entry-infobar-published-at">
                    <RelativeTime time={entry.publishedAt} />
                </span>
            );
        }

        return null;
    }

    render() {
        const { entry, isActive, isCollapsible, isExpanded } = this.props;

        return (
            <article
                id={'entry-' + entry.entryId}
                className={classnames('entry', { 
                    'is-active': isActive,
                    'is-collapsible': isCollapsible,
                    'is-expanded': isExpanded,
                    'is-unread': !entry.readAt
                })}>
                <div className="container">
                    <div className="entry-toolbar">
                        <a className="entry-toolbar-item" href="#"><i className="icon icon-16 icon-new-document"></i></a>
                        <a className="entry-toolbar-item" href="#"><i className="icon icon-16 icon-pin-3"></i></a>
                        <a className="entry-toolbar-item entry-close" href="#" onClick={this.handleClose.bind(this)}><i className="icon icon-16 icon-close"></i></a>
                    </div>
                    <h2 className="entry-title">
                        <a
                            target="_blank"
                            href={entry.url}
                            onClick={this.handleCollapse.bind(this)}>
                            {entry.title}
                        </a>
                    </h2>
                    <div className="entry-infobar">
                        {this.renderBookmarks()}
                        {this.renderOrign()}
                        {this.renderAuthor()}
                        {this.renderPublishedAt()}
                    </div>
                    <StripHtml className="entry-description" html={entry.description} />
                    <div dangerouslySetInnerHTML={{ __html: entry.content }} className="entry-content" />
                    <div className="entry-actionbar">
                        <a className="entry-actionbar-item" href="#"><i className="icon icon-20 icon-bookmark"></i></a>
                        <a className="entry-actionbar-item" href="#"><i className="icon icon-20 icon-external-link"></i></a>
                        <a className="entry-actionbar-item" href="#"><i className="icon icon-20 icon-share"></i></a>
                    </div>
                </div>
            </article>
        );
    }
}
