import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import {
  classMap,
  component,
  keyedList,
  memo,
} from '@emonkak/ebit/directives.js';

export interface TabListProps {
  items: Tab[];
  onTabSelect?: (key: string) => void;
}

export interface Tab {
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
    (tab) => tab.key,
    (tab) =>
      memo(() => component(Tab, { tab, onTabSelect }), [tab, onTabSelect]),
  );

  return context.html`
    <div class="TabList" role="tablist">
      <${tabs}>
    </div>
  `;
}

function Tab(
  { tab, onTabSelect }: { tab: Tab; onTabSelect?: (key: string) => void },
  context: RenderContext,
): TemplateResult {
  const handleTabSelect = context.useCallback(
    (event: Event) => {
      tab.onSelect?.(event);
      onTabSelect?.(tab.key);
    },
    [onTabSelect, tab.onSelect, tab.key],
  );

  return context.html`
    <button
      aria-selected=${tab.selected.toString()}
      class=${classMap({
        Tab: true,
        'is-selected': tab.selected,
      })}
      data-key=${tab.key}
      role="tab"
      @click=${handleTabSelect}
    >
      <${tab.children}>
    </button>
  `;
}
