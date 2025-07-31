import { memo, type RenderContext } from 'barebind';

import type { SiteinfoItem } from 'feedpon-messaging';

interface SharedSiteinfoItemProps {
  item: SiteinfoItem;
}

export function SharedSiteinfoItem(
  { item }: SharedSiteinfoItemProps,
  context: RenderContext,
): unknown {
  return context.html`
    <li class="list-group-item">
      <div>
        <div>
          <strong>${item.name}</strong>
        </div>
        <dl class="u-margin-remove">
          <dt>URL pattern</dt>
          <dd>
            <code>${item.urlPattern}</code>
          </dd>
          <dt>Content expression</dt>
          <dd>
            <code>${item.contentExpression}</code>
          </dd>
          <dt>Next link expression</dt>
          <dd>
            <code>${item.nextLinkExpression}</code>
          </dd>
        </dl>
      </div>
    </li>
  `;
}

memo(SharedSiteinfoItem);
