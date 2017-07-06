import React from 'react';

import { SiteinfoItem } from 'messaging/types';

interface SharedSiteinfoItemProps {
    item: SiteinfoItem;
}

const SharedSiteinfoItem: React.SFC<SharedSiteinfoItemProps> = ({
    item
}) => {
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

export default SharedSiteinfoItem;
