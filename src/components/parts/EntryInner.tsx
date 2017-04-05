import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';

import CleanHtml from 'components/parts/CleanHtml';
import RelativeTime from 'components/parts/RelativeTime';
import StripTags from 'components/parts/StripTags';
import { Entry } from 'messaging/types';

interface Props {
    entry: Entry;
    onClose?: (event: React.SyntheticEvent<any>) => void;
    onCollapse?: (event: React.SyntheticEvent<any>) => void;
}

export default class EntryInner extends PureComponent<Props, {}> {
    static propTypes = {
        entry: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
        onCollapse: PropTypes.func.isRequired
    };

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
                <i className="icon icon-align-bottom icon-16 icon-bookmark" />{entry.bookmarkCount}
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
                <StripTags className="entry-summary" html={entry.summary} />
                <CleanHtml className="entry-content" html={entry.content} />
                <footer className="entry-footer">
                    <a className="entry-action" href="#"><i className="icon icon-20 icon-bookmark"></i></a>
                    <a className="entry-action" href="#"><i className="icon icon-20 icon-external-link"></i></a>
                    <a className="entry-action" href="#"><i className="icon icon-20 icon-share"></i></a>
                </footer>
            </div>
        );
    }
}
