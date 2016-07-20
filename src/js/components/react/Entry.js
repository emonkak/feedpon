import EntryContent from './EntryContent';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import appContextTypes from '../../shared/components/react/appContextTypes';
import classnames from 'classnames';
import { ExpandUrl, FetchFullContent } from '../../constants/actionTypes';

export default class Entry extends React.Component {
    static propTypes = {
        entry: React.PropTypes.object.isRequired,
        isActive: React.PropTypes.bool.isRequired
    };

    static contextTypes = appContextTypes;

    componentWillMount() {
        const { entry } = this.props;

        entry.alternate.forEach(({ href }) => {
            this.context.dispatch({
                actionType: ExpandUrl,
                url: href
            });
        });
    }

    handleFetchFullContent() {
        const { entry } = this.props;

        const url = getNextLink(entry);
        if (url != null) {
            this.context.dispatch({
                actionType: FetchFullContent,
                streamId: entry.id,
                url
            });
        }
    }

    render() {
        const { entry, isActive } = this.props;
        const fullContents = entry._fullContents || [];

        const contents = fullContents.length > 0
            ? fullContents.map(({ content, url }, i) => <EntryContent key={i} content={content} url={url} />)
            : entry.content ? <EntryContent content={entry.content.content} url={entry.alternate[0].href} /> : null;

        const actions = getNextLink(entry)
            ? <button className="button button-default button-fill" onClick={::this.handleFetchFullContent}>Fetch Full Content</button>
            : null;

        return (
            <li className={classnames("entry", { 'is-active': isActive })}>
                <h2 className="entry-title">
                    <a href={entry.alternate[0].href} target="_blank">{entry.title}</a>
                </h2>

                <p className="entry-url">
                    <a href={entry.alternate[0].href} target="_blank">{entry.alternate[0].href}</a>
                </p>

                <div className="entry-contents">{contents}</div>

                <footer className="entry-footer">
                    <time className="entry-timestamp">{new Date(entry.published).toLocaleString()}</time>
                    <div className="entry-actions">{actions}</div>
                </footer>
            </li>
        );
    }
}

Object.assign(Entry.prototype, PureRenderMixin);

function getNextLink(entry) {
    const fullContents = entry._fullContents;

    return fullContents && fullContents.length > 0
        ? fullContents[fullContents.length - 1].nextLink
        : entry.alternate[0].href;
}
