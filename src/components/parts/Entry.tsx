import * as React from 'react';
import * as moment from 'moment';

export default class Entry extends React.Component<any, any> {
    static propTypes = {
        title: React.PropTypes.string.isRequired,
        url: React.PropTypes.string.isRequired,
        author: React.PropTypes.string.isRequired,
        postedAt: React.PropTypes.string.isRequired,
        body: React.PropTypes.string.isRequired,
    };

    render() {
        const { title, url, author, postedAt, body } = this.props;

        return (
            <article className="entry">
                <header className="entry-header">
                    <h2 className="entry-title"><a className="link-default" target="_blank" href={url}>{title}</a></h2>
                    <div className="entry-info">
                        <ul className="list-inline list-inline-dot">
                            <li>{author}</li>
                            <li>{moment(postedAt).fromNow()}</li>
                        </ul>
                    </div>
                </header>
                <div className="entry-body" dangerouslySetInnerHTML={body} />
                <footer className="entry-footer">
                    <ul className="list-inline list-inline-dot u-baseline-double">
                        <li><a className="link-default" href="#"><i className="icon icon-32 icon-pin-3"></i></a></li>
                        <li><a className="link-default" href="#"><i className="icon icon-32 icon-bookmark"></i></a></li>
                        <li><a className="link-default" href="#"><i className="icon icon-32 icon-comments"></i></a></li>
                        <li><a className="link-default" href="#"><i className="icon icon-32 icon-share"></i></a></li>
                    </ul>
                </footer>
            </article>
        );
    }
}
