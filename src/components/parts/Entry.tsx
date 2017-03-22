import React, { PropTypes, PureComponent } from 'react';
import classnames from 'classnames';
import { findDOMNode } from 'react-dom';

import RelativeTime from 'components/parts/RelativeTime';
import StripHtml from 'components/parts/StripHtml';

export default class Entry extends PureComponent<any, any> {
    static propTypes = {
        active: PropTypes.bool,
        collapsible: PropTypes.bool,
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
        collapsible: false,
        expanded: false
    };

    handleCollapse(event: React.SyntheticEvent<any>) {
        const { onCollapse, collapsible, expanded } = this.props;

        if (collapsible && !expanded && onCollapse) {
            event.preventDefault();

            onCollapse(findDOMNode(this));
        }
    }

    handleClose() {
        const { collapsible, expanded, onClose } = this.props;

        if (collapsible && expanded && onClose) {
            onClose();
        }
    }

    renderContent() {
        const { entry, expanded } = this.props;

        if (expanded) {
            return (
                <div dangerouslySetInnerHTML={{ __html: entry.content }} className="entry-content" />
            );
        } else {
            return (
                <StripHtml className="entry-description" html={entry.description} />
            );
        }
    }

    render() {
        const { active, collapsible, entry, expanded } = this.props;

        return (
            <article
                id={'entry-' + entry.entryId}
                className={classnames('entry', { 
                    'is-active': active,
                    'is-collapsible': collapsible,
                    'is-expanded': expanded
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
                        <div className="entry-info">
                            <ul className="list-inline list-inline-dot">
                                {entry.origin && (<li className="entry-origin"><a target="_blank" href={entry.origin.url}>{entry.origin.title}</a></li>)}
                                {entry.author && (<li className="entry-author">{entry.author}</li>)}
                                {entry.publishedAt && (<li className="entry-published-at"><RelativeTime time={entry.publishedAt} /></li>)}
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
