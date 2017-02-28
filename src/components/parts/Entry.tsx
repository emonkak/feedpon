import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import moment from 'moment';

import stripHtml from 'utils/stripHtml';

export default class FullEntry extends PureComponent<any, any> {
    static propTypes = {
        author: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        entryId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]).isRequired,
        isActive: PropTypes.bool,
        publishedAt: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        origin: PropTypes.shape({
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        }),
        viewMode: PropTypes.oneOf(['full', 'compact']).isRequired
    };

    static defaultProps = {
        isActive: false
    };

    renderContent() {
        const { content, description, viewMode } = this.props;

        if (viewMode === 'full') {
            return (
                <div className="entry-content" dangerouslySetInnerHTML={{ __html: content }} />
            );
        } else {
            return (
                <div className="entry-description">{stripHtml(description)}</div>
            )
        }
    }

    render() {
        const { author, isActive, origin, publishedAt, title, url, viewMode } = this.props;

        return (
            <article className={classnames(
                'entry',
                { 
                    'is-active': isActive,
                    'is-expanded': viewMode === 'full',
                }
            )}>
                <div className="container">
                    <header className="entry-header">
                        <h2 className="entry-title"><a target="_blank" href={url}>{title}</a></h2>
                        <div className="entry-info">
                            <ul className="list-inline list-inline-dot">
                                {origin && (<li className="entry-origin"><a href={origin.url}>{origin.title}</a></li>)}
                                {author && (<li className="entry-author">{author}</li>)}
                                {publishedAt && (<li className="entry-published-at">{moment(publishedAt).fromNow()}</li>)}
                            </ul>
                        </div>
                    </header>
                    {this.renderContent()}
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
