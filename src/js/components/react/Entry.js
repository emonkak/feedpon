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

    render() {
        const { entry, isActive } = this.props;

        const actions = this._nextLink(entry)
            ? <button className="button button-default button-fill" onClick={::this._handleFetchFullContent}>Fetch Full Content</button>
            : null;

        return (
            <li className={classnames("entry", { 'is-active': isActive })}>
                <h2 className="entry-title">
                    <a href={entry.alternate[0].href} target="_blank">{entry.title}</a>
                </h2>

                <p className="entry-url">
                    <a href={entry.alternate[0].href} target="_blank">{entry.alternate[0].href}</a>
                </p>

                <ul className="entry-contents">{this._renderContents()}</ul>

                <footer className="entry-footer">
                    <time className="entry-timestamp">{new Date(entry.published).toLocaleString()}</time>
                    <div className="entry-actions">{actions}</div>
                </footer>
            </li>
        );
    }

    _renderContents() {
        const { entry } = this.props;
        const fullContents = entry._fullContents || [];

        if (fullContents.length > 0) {
            return fullContents.map(({ content, url }, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: content }} />
            ));
        }

        if (entry.content) {
            return <li dangerouslySetInnerHTML={{ __html: entry.content.content }} />
        }

        return null;
    }

    _handleFetchFullContent() {
        const { entry } = this.props;

        const url = this._nextLink(entry);
        if (url != null) {
            this.context.dispatch({
                actionType: FetchFullContent,
                streamId: entry.id,
                url
            });
        }
    }

    _nextLink(entry) {
        const fullContents = entry._fullContents;

        return fullContents && fullContents.length > 0
            ? fullContents[fullContents.length - 1].nextLink
            : entry.alternate[0].href;
    }
}

Object.assign(Entry.prototype, PureRenderMixin);
