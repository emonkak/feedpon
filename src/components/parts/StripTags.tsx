import React, { PropTypes, PureComponent } from 'react';

import stripTags from 'supports/dom/stripTags';

interface Props {
    className?: string;
    html?: string;
}

export default class StripHtml extends PureComponent<Props, {}> {
    static propTypes = {
        className: PropTypes.string,
        html: PropTypes.string
    };

    render() {
        const { className, html } = this.props;

        return (
            <div className={className}>{html != null ? stripTags(html) : ''}</div>
        );
    }
}
