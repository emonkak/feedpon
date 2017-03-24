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

    handleClose() {
        const { isCollapsible, isExpanded, onClose } = this.props;

        if (isCollapsible && isExpanded && onClose) {
            onClose();
        }
    }

    renderBookmarks() {
        const { entry } = this.props;

        const urlPrefix = 'http://b.hatena.ne.jp/entry/';

        return (
            <span className={classnames('entry-info', 'entry-bookmarks', {
                'is-bookmarked': entry.bookmarks > 0,
                'is-popular': entry.bookmarks >= 10,
                'is-very-popular': entry.bookmarks >= 20
            })}>
                <a target="_blank" href={urlPrefix + entry.url}><i className="icon icon-16 icon-bookmark" />{entry.bookmarks}</a>
            </span>
        );
    }

    renderOrign() {
        const { entry } = this.props;

        if (entry.origin != null) {  // FIXME: If same origin
            return (
                <span className="entry-info entry-origin">
                    <a target="_blank" href={entry.origin.url}><strong>{entry.origin.title}</strong></a>
                </span>
            );
        }

        return null;
    }

    renderAuthor() {
        const { entry } = this.props;

        if (entry.author != null) {
            return (
                <span className="entry-info entry-author">
                    by <strong>{entry.author}</strong>
                </span>
            );
        }

        return null;
    }

    renderPublishedAt() {
        const { entry } = this.props;

        if (entry.publishedAt != null) {
            return (
                <span className="entry-info entry-published-at">
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
                    <header className="entry-header">
                        <button type="button" className="close" onClick={this.handleClose.bind(this)} />
                        <h2 className="entry-title">
                            <a
                                target="_blank"
                                href={entry.url}
                                onClick={this.handleCollapse.bind(this)}>
                                {entry.title}
                            </a>
                        </h2>
                        <div>
                            {this.renderBookmarks()}
                            {this.renderOrign()}
                            {this.renderAuthor()}
                            {this.renderPublishedAt()}
                        </div>
                    </header>
                    <StripHtml className="entry-description" html={entry.description} />
                    <div dangerouslySetInnerHTML={{ __html: entry.content }} className="entry-content" />
                    <div className="entry-action-list">
                        <a className="entry-action" href="#"><i className="icon icon-24 icon-pin-3"></i></a>
                        <a className="entry-action" href="#"><i className="icon icon-24 icon-bookmark"></i></a>
                        <a className="entry-action" href="#"><i className="icon icon-24 icon-comments"></i></a>
                        <a className="entry-action" href="#"><i className="icon icon-24 icon-share"></i></a>
                    </div>
                </div>
            </article>
        );
    }
}
