import React, { PropTypes, PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import sanitizeNode from 'utils/dom/sanitizeNode';

export default class SanitizeHtml extends PureComponent<any, any> {
    static propTypes = {
        className: PropTypes.string,
        html: PropTypes.string.isRequired
    };

    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        const { html } = this.props;
        const node = findDOMNode(this);

        const parser = new DOMParser();
        const parsedDocument = parser.parseFromString(html, 'text/html');

        for (const child of parsedDocument.body.childNodes) {
            sanitizeNode(child);
        }

        const fragment = document.createDocumentFragment();
        fragment.appendChild(parsedDocument.documentElement);

        if (node.firstChild) {
            node.replaceChild(fragment, node.firstChild);
        } else {
            node.appendChild(fragment);
        }
    }

    render() {
        const { className } = this.props;

        return (
            <div className={className}></div>
        );
    }
}

