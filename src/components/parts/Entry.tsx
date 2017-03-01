import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import moment from 'moment';

import stripHtml from 'utils/stripHtml';

export default class Entry extends PureComponent<any, any> {
    static propTypes = {
        active: PropTypes.bool,
        closable: PropTypes.bool,
        entry: PropTypes.shape({
            author: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            entryId: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.number
            ]).isRequired,
            publishedAt: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
            origin: PropTypes.shape({
                title: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
            })
        }),
        expanded: PropTypes.bool,
        handleClickTitle: PropTypes.func,
        onClose: PropTypes.func
    };

    static defaultProps = {
        active: false,
        closable: false,
        expanded: false
    };

    handleClickTitle(event: React.MouseEvent<any>) {
        const { onClickTitle } = this.props;

        if (onClickTitle) {
            event.preventDefault();

            onClickTitle();
        }
    }

    renderContent() {
        const { entry, expanded } = this.props;
        const { content, description } = entry;

        if (expanded) {
            return (
                <div className="entry-content" dangerouslySetInnerHTML={{ __html: content }} />
            );
        } else {
            return (
                <div className="entry-description">{stripHtml(description)}</div>
            );
        }
    }

    render() {
        const { active, closable, entry, expanded, onClose } = this.props;
        const { author, origin, publishedAt, title, url } = entry;

        return (
            <article
                className={classnames('entry', { 
                    'is-active': active,
                    'is-expanded': expanded
                })}>
                <div className="container">
                    {closable && <button type="button" className="close" onClick={onClose} />}
                    <header className="entry-header">
                        <h2 className="entry-title">
                            <a
                                className={classnames('entry-title', {
                                    'dropdown-arrow': !expanded
                                })}
                                target="_blank"
                                href={url}
                                onClick={this.handleClickTitle.bind(this)}>
                                {title}
                            </a>
                        </h2>
                        <div className="entry-info">
                            <ul className="list-inline list-inline-dot">
                                {origin && (<li className="entry-origin"><a target="_blank" href={origin.url}>{origin.title}</a></li>)}
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
