import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  classMap,
  component,
  keyedList,
  memo,
} from '@emonkak/ebit/directives.js';

export interface TabListProps {
  items: TabItem[];
  onTabSelect?: (event: Event, key: string) => void;
}

export interface TabItem {
  href?: string;
  children: TemplateResult;
  key: string;
  onSelect?: (event: Event) => void;
  selected: boolean;
}

export function TabList(
  { items, onTabSelect }: TabListProps,
  context: RenderContext,
): TemplateResult {
  const tabs = keyedList(
    items,
    (item) => item.key,
    (item) =>
      memo(
        () => component(TabItem, { item, onTabSelect }),
        [item, onTabSelect],
      ),
  );

  return context.html`
    <div class="TabList" role="tablist">
      <${tabs}>
    </div>
  `;
}

function TabItem(
  {
    item,
    onTabSelect,
  }: { item: TabItem; onTabSelect?: (event: Event, key: string) => void },
  context: RenderContext,
): TemplateResult {
  const handleTabSelect = context.useCallback(
    (event: Event) => {
      item.onSelect?.(event);
      onTabSelect?.(event, item.key);
    },
    [onTabSelect, item.onSelect, item.key],
  );

  if (item.href !== undefined) {
    return context.html`
      <a
        aria-selected=${item.selected.toString()}
        class=${classMap({
          Tab: true,
          'is-selected': item.selected,
        })}
        data-key=${item.key}
        href=${item.href}
        role="tab"
        @click=${handleTabSelect}
      >
        <${item.children}>
      </button>
    `;
  } else {
    return context.html`
      <button
        aria-selected=${item.selected.toString()}
        class=${classMap({
          Tab: true,
          'is-selected': item.selected,
        })}
        data-key=${item.key}
        role="tab"
        type="button"
        @click=${handleTabSelect}
      >
        <${item.children}>
      </button>
    `;
  }
}
