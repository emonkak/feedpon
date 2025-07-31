import { component, memo, type RenderContext, repeat } from 'barebind';

export interface TabListProps {
  items: TabItem[];
  onTabSelect?: (event: Event, key: string) => void;
}

export interface TabItem {
  href?: string;
  children: unknown;
  key: string;
  onSelect?: (event: Event) => void;
  selected: boolean;
}

export function TabList(
  { items, onTabSelect }: TabListProps,
  context: RenderContext,
): unknown {
  const tabs = repeat({
    source: items,
    keySelector: (item) => item.key,
    valueSelector: (item) => component(TabItem, { item, onTabSelect }),
  });

  return context.html`
    <div class="TabList" role="tablist">
      <${tabs}>
    </div>
  `;
}

export function TabItem(
  {
    item,
    onTabSelect,
  }: {
    item: TabItem;
    onTabSelect: ((event: Event, key: string) => void) | undefined;
  },
  context: RenderContext,
): unknown {
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
        :classlist=${[
          'Tab',
          {
            'is-selected': item.selected,
          },
        ]}
        aria-selected=${item.selected.toString()}
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
        :classlist=${[
          'Tab',
          {
            'is-selected': item.selected,
          },
        ]}
        aria-selected=${item.selected.toString()}
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

memo(TabItem);
