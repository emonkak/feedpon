import type { RenderContext } from 'barebind';
import type { Category } from 'feedpon-messaging';

interface CategoryHeaderProps {
  category: Category;
  hasMoreEntries: boolean;
  numEntries: number;
}

export function CategoryHeader(
  { category, hasMoreEntries, numEntries }: CategoryHeaderProps,
  context: RenderContext,
): unknown {
  return context.html`
    <header class="stream-header">
      <div class="container">
        <div class="u-flex u-flex-align-items-center u-flex-justify-content-between">
          <div class="u-margin-right-2 u-flex-grow-1">
            <div>
              <strong>${category.label}</strong>
            </div>
            <div class="list-inline list-inline-dotted">
              <div class="list-inline-item u-text-muted">
                <span class="u-text-4">${numEntries}${hasMoreEntries ? '+' : ''}</span> entries
              </div>
            </div>
          </div>
          <div class="u-flex-shrink-0">
            <a
              class="button button-outline-default"
              href=${`#/categories/${category.label}`}
              title="Organize category..."
            >
              <i class="icon icon-20 icon-edit"></i>
            </a>
          </div>
        </div>
      </div>
    </header>
  `;
}
