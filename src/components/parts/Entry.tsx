import * as React from 'react';
import * as classnames from 'classnames';
import * as moment from 'moment';

export default class FullEntry extends React.Component<any, any> {
    static propTypes = {
        author: React.PropTypes.string.isRequired,
        content: React.PropTypes.string.isRequired,
        entryId: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.number
        ]).isRequired,
        publishedAt: React.PropTypes.string.isRequired,
        title: React.PropTypes.string.isRequired,
        url: React.PropTypes.string.isRequired,
        origin: React.PropTypes.shape({
            title: React.PropTypes.string.isRequired,
            url: React.PropTypes.string.isRequired,
        }),
        viewMode: React.PropTypes.oneOf(['full', 'compact']).isRequired
    };

    render() {
        const { author, content, description, origin, publishedAt, title, url, viewMode } = this.props;

        return (
            <article className={classnames('entry', 'entry-' + viewMode)}>
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
