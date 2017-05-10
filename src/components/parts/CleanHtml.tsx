import React, { PureComponent } from 'react';
import { findDOMNode } from 'react-dom';

import cleanNode from 'utils/dom/cleanNode';
import walkNode from 'utils/dom/walkNode';

interface CleanHtmlProps {
    className?: string;
    baseUrl: string;
    html: string | null;
}

export default class CleanHtml extends PureComponent<CleanHtmlProps, {}> {
    componentDidMount() {
        this.update();
    }

    componentDidUpdate() {
        this.update();
    }

    update() {
        const { baseUrl, html } = this.props;

        if (html != null) {
            const parser = new DOMParser();
            const parsedDocument = parser.parseFromString(html, 'text/html');
            const fragment = document.createDocumentFragment();

            for (const child of parsedDocument.body.childNodes) {
                walkNode(child, (node) => cleanNode(node, baseUrl));

                fragment.appendChild(child);
            }

            const container = findDOMNode(this);

            if (container.firstChild) {
                container.replaceChild(fragment, container.firstChild);
            } else {
                container.appendChild(fragment);
            }
        }
    }

    render() {
        const { className } = this.props;

        return (
            <div className={className}></div>
        );
    }
}
