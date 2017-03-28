import React, { PropTypes, PureComponent } from 'react';

import stripHtml from 'supports/dom/stripHtml';

export default class StripHtml extends PureComponent<any, any> {
    static propTypes = {
        className: PropTypes.string,
        html: PropTypes.string.isRequired
    };

    render() {
        const { className, html } = this.props;

        return (
            <div className={className}>{stripHtml(html)}</div>
        );
    }
}


