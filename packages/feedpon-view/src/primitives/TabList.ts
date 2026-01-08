import {
  createComponent,
  type RenderContext,
  Repeat,
  shallowEqual,
} from 'barebind';

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

export const TabList = createComponent(function TabList(
  { items, onTabSelect }: TabListProps,
  $: RenderContext,
): unknown {
  const tabs = Repeat({
    items,
    keySelector: (item) => item.key,
    valueSelector: (item) => TabItem({ item, onTabSelect }),
  });

  return $.html`
    <div class="TabList" role="tablist">
      <${tabs}>
    </div>
  `;
});

export const TabItem = createComponent(
  function TabItem(
    {
      item,
      onTabSelect,
    }: {
      item: TabItem;
      onTabSelect: ((event: Event, key: string) => void) | undefined;
    },
    $: RenderContext,
  ): unknown {
    const handleTabSelect = $.useCallback(
      (event: Event) => {
        item.onSelect?.(event);
        onTabSelect?.(event, item.key);
      },
      [onTabSelect, item.onSelect, item.key],
    );

    if (item.href !== undefined) {
      return $.html`
        <a
          :class=${{
            Tab: true,
            'is-selected': item.selected,
          }}
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
      return $.html`
        <button
          :class=${{
            Tab: true,
            'is-selected': item.selected,
          }}
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
  },
  { arePropsEqual: shallowEqual },
);
