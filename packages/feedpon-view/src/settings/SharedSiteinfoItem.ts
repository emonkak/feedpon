import { createComponent, type RenderContext, shallowEqual } from 'barebind';

import type { SiteinfoItem } from 'feedpon-messaging';

interface SharedSiteinfoItemProps {
  item: SiteinfoItem;
}

export const SharedSiteinfoItem = createComponent(
  function SharedSiteinfoItem(
    { item }: SharedSiteinfoItemProps,
    $: RenderContext,
  ): unknown {
    return $.html`
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
  },
  { shouldSkipUpdate: shallowEqual },
);
