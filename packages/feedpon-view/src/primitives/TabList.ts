import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, keyedList } from '@emonkak/ebit/directives.js';

export interface TabListProps {
  items: TabItem[];
  onTabSelect: (key: string) => void;
}

export interface TabItem {
  children: TemplateResult;
  key: string;
  selected: boolean;
}

export function TabList(
  { items, onTabSelect }: TabListProps,
  context: RenderContext,
): TemplateResult {
  const handleTabSelect = context.useCallback(
    (event: Event) => {
      const key = (event.currentTarget as HTMLElement).dataset['key']!;
      onTabSelect(key);
    },
    [onTabSelect],
  );

  const tabs = keyedList(
    items,
    (item) => item.key,
    (item) => context.html`
      <button
        aria-selected=${item.selected.toString()}
        class=${classMap({
          Tab: true,
          'is-selected': item.selected,
        })}
        data-key=${item.key}
        role="tab"
        @click=${handleTabSelect}
      >
        <${item.children}>
      </button>
    `,
  );

  return context.html`
    <div class="TabList" role="tablist">
      <${tabs}>
    </div>
  `;
}
