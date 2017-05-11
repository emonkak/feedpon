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
            const { body } = parser.parseFromString(html, 'text/html');

            if (body.firstChild) {
                walkNode(body.firstChild, (node) => cleanNode(node, baseUrl));
            }

            const fragment = document.createDocumentFragment();

            for (let node = body.firstChild; node; node = body.firstChild) {
                fragment.appendChild(node);
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
