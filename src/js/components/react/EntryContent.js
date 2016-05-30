import PureRenderMixin from 'react-addons-pure-render-mixin';
import React from 'react';
import appContextTypes from './appContextTypes';

export default class EntryContent extends React.Component {
    static propTypes = {
        url: React.PropTypes.string.isRequired,
        content: React.PropTypes.string.isRequired
    };

    static contextTypes = appContextTypes;

    render() {
        const { content } = this.props;

        return (
            <div dangerouslySetInnerHTML={{ __html: content }} />
        );
    }
}

Object.assign(EntryContent.prototype, PureRenderMixin);
