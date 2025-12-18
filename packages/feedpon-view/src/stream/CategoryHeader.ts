import { createComponent, type RenderContext } from 'barebind';
import type { Category } from 'feedpon-store';

interface CategoryHeaderProps {
  category: Category;
}

export const CategoryHeader = createComponent(function CategoryHeader(
  { category }: CategoryHeaderProps,
  $: RenderContext,
): unknown {
  return $.html`
    <header class="stream-header">
      <div class="container">
        <div class="u-flex u-flex-align-items-center u-flex-justify-content-between">
          <div class="u-margin-right-2 u-flex-grow-1">
            <div>
              <strong>${category.label}</strong>
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
});
