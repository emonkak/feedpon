import { createComponent, shallowEqual, html } from 'barebind';

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

export const TabList = createComponent<TabListProps>(function TabList({
  items,
  onTabSelect,
}) {
  return html`
    <div class="TabList" role="tablist">
      ${items.map((item) => TabItem({ item, onTabSelect }).withKey(item.key))}
    </div>
  `;
});

export const TabItem = createComponent<{
  item: TabItem;
  onTabSelect: ((event: Event, key: string) => void) | undefined;
}>(
  function TabItem({ item, onTabSelect }) {
    const handleTabSelect = this.useCallback(
      (event: Event) => {
        item.onSelect?.(event);
        onTabSelect?.(event, item.key);
      },
      [onTabSelect, item.onSelect, item.key],
    );

    if (item.href !== undefined) {
      return html`
        <a
          class=${{
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
        </a>
      `;
    } else {
      return html`
        <button
          class=${{
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
