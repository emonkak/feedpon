import React, { PureComponent } from 'react';

import type { SiteinfoItem } from 'feedpon-messaging';

interface SharedSiteinfoItemProps {
    item: SiteinfoItem;
}

export default class SharedSiteinfoItem extends PureComponent<SharedSiteinfoItemProps> {
    override render() {
        const { item } = this.props;

        return (
            <li className="list-group-item">
                <div>
                    <div><strong>{item.name}</strong></div>
                    <dl className="u-margin-remove">
                        <dt>URL pattern</dt>
                        <dd><code>{item.urlPattern}</code></dd>
                        <dt>Content expression</dt>
                        <dd><code>{item.contentExpression}</code></dd>
                        <dt>Next link expression</dt>
                        <dd><code>{item.nextLinkExpression}</code></dd>
                    </dl>
                </div>
            </li>
        );
    }
}
