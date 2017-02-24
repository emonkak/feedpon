import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import moment from 'moment';

export default class Entry extends PureComponent<any, any> {
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

    render() {
        const { author, content, isActive, description, origin, publishedAt, title, url, viewMode } = this.props;

        return (
            <article className={classnames(
                'entry',
                'entry-' + viewMode,
                { 'is-active': isActive }
            )}>
                <div className="container">
                    <header className="entry-header">
                        <h2 className="entry-title"><a className="link-default" target="_blank" href={url}>{title}</a></h2>
                        <div className="entry-info">
                            <ul className="list-inline list-inline-dot">
                                {origin && (<li className="entry-origin"><a href={origin.url}>{origin.title}</a></li>)}
                                {author && (<li className="entry-author">{author}</li>)}
                                {publishedAt && (<li className="entry-published-at">{moment(publishedAt).fromNow()}</li>)}
                            </ul>
                        </div>
                    </header>
                    <div className="entry-content" dangerouslySetInnerHTML={{ __html: viewMode === 'full' ? content : description }} />
                    <footer className="entry-footer">
                        <ul className="list-inline list-inline-dot u-baseline-2">
                            <li><a className="link-default" href="#"><i className="icon icon-32 icon-pin-3"></i></a></li>
                            <li><a className="link-default" href="#"><i className="icon icon-32 icon-bookmark"></i></a></li>
                            <li><a className="link-default" href="#"><i className="icon icon-32 icon-comments"></i></a></li>
                            <li><a className="link-default" href="#"><i className="icon icon-32 icon-share"></i></a></li>
                        </ul>
                    </footer>
                </div>
            </article>
        );
    }
}
