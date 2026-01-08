import {
  type Bindable,
  type Component,
  createComponent,
  type RenderContext,
  Repeat,
} from 'barebind';

export interface TreeProps<TKey = unknown, TValue = unknown> {
  items: TreeItem<TKey, TValue>[];
  renderItem: (value: TValue, key: TKey, context: RenderContext) => unknown;
  onSelect(item: TreeItem<TKey, TValue>): void;
}

export interface TreeItem<TKey = unknown, TValue = unknown> {
  children: TreeItem<TKey, TValue>[];
  defaultExpanded?: boolean;
  key: TKey;
  selected: boolean;
  value: TValue;
}

interface ItemAggregation<TKey, TValue> {
  item: TreeItem<TKey, TValue>;
  state: UnmanagedState;
  parent: ItemAggregation<TKey, TValue> | null;
}

interface UnmanagedState {
  expanded: boolean;
  level: number;
  userInteraction: boolean;
}

export interface Tree extends Component<TreeProps> {
  <TKey, TValue>(
    props: TreeProps<TKey, TValue>,
  ): Bindable<TreeProps<TKey, TValue>>;
}

export const Tree: Tree = createComponent(function Tree<TKey, TValue>(
  { items, renderItem, onSelect }: TreeProps<TKey, TValue>,
  $: RenderContext,
): unknown {
  const unmanagedStatesRef = $.useMemo(
    () => ({ current: new Map<TKey, UnmanagedState>() }),
    [],
  );
  const oldUnmanagedStates = unmanagedStatesRef.current;
  const newUnmanagedStates = new Map<TKey, UnmanagedState>();

  const forceUpdate = $.useCallback(() => {
    $.forceUpdate();
  }, []);

  const aggregate = (
    accumulator: ItemAggregation<TKey, TValue>[],
    item: TreeItem<TKey, TValue>,
    parent: ItemAggregation<TKey, TValue> | null,
  ): ItemAggregation<TKey, TValue>[] => {
    const level = parent !== null ? parent.state.level + 1 : 0;
    let state = oldUnmanagedStates.get(item.key);

    if (state !== undefined) {
      state.level = level;
    } else {
      state = {
        expanded: item.defaultExpanded ?? false,
        level,
        userInteraction: false,
      };
    }

    const aggregation = { item, state, parent };
    const childAggregations = item.children.reduce(
      (results, item) => aggregate(results, item, aggregation),
      [] as typeof accumulator,
    );

    accumulator.push(aggregation);

    if (item.selected && parent !== null && !parent.state.userInteraction) {
      parent.state.expanded = true;
      parent.state.userInteraction = false;
    }

    if (state.expanded) {
      accumulator.push(...childAggregations);
    }

    newUnmanagedStates.set(item.key, state);

    return accumulator;
  };

  const children = Repeat({
    items: items.reduce(
      (results, item) => aggregate(results, item, null),
      [] as ItemAggregation<TKey, TValue>[],
    ),
    keySelector: ({ item }) => item.key,
    valueSelector: ({ item, state, parent }) =>
      TreeNode({
        children: renderItem(item.value, item.key, $),
        item,
        onSelect,
        onStateUpadte: forceUpdate,
        parent,
        state,
      }),
  });

  unmanagedStatesRef.current = newUnmanagedStates;

  return $.html`
    <div class="Tree" role="tree">
      <${children}>
    </div>
  `;
});

interface TreeNode extends Component<TreeNodeProps> {
  <T>(props: TreeNodeProps<T>): Bindable<TreeNodeProps<T>>;
}

interface TreeNodeProps<TKey = unknown, TValue = unknown> {
  children: unknown;
  item: TreeItem<TKey, TValue>;
  onSelect(item: TreeItem<TKey, TValue>): void;
  onStateUpadte: () => void;
  parent: ItemAggregation<TKey, TValue> | null;
  state: UnmanagedState;
}

const TreeNode: TreeNode = createComponent(function TreeNode<TKey, TValue>(
  {
    children,
    item,
    onSelect,
    onStateUpadte,
    state,
    parent,
  }: TreeNodeProps<TKey, TValue>,
  $: RenderContext,
): unknown {
  const handleClick = $.useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      onSelect(item);
    },
    [onSelect, item.value],
  );

  const handleKeyDown = $.useCallback(
    (event: KeyboardEvent) => {
      if (event.currentTarget !== event.target) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          event.stopPropagation();
          if (state.expanded) {
            state.expanded = false;
            state.userInteraction = true;
            onStateUpadte();
          } else if (parent?.state.expanded) {
            matchPrevious<HTMLElement>(
              event.currentTarget as Element,
              (element) =>
                element.matches(`.TreeItem[aria-level="${state.level - 1}"]`),
            )?.focus();
            parent.state.expanded = false;
            parent.state.userInteraction = true;
            onStateUpadte();
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          event.stopPropagation();
          if (item.children.length > 0 && !state.expanded) {
            state.expanded = true;
            state.userInteraction = true;
            onStateUpadte();
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          matchNext<HTMLElement>(event.currentTarget as Element, (element) =>
            element.matches('.TreeItem'),
          )?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          matchPrevious<HTMLElement>(
            event.currentTarget as Element,
            (element) => element.matches('.TreeItem'),
          )?.focus();
          break;
        case 'Home':
          event.preventDefault();
          event.stopPropagation();
          (event.currentTarget as Element).parentElement
            ?.querySelector<HTMLElement>('.TreeItem')
            ?.focus();
          break;
        case 'End':
          event.preventDefault();
          event.stopPropagation();
          (event.currentTarget as Element).parentElement
            ?.querySelector<HTMLElement>('.TreeItem:last-of-type')
            ?.focus();
          break;
        case 'Enter':
        case ' ':
          event.stopPropagation();
          event.preventDefault();
          onSelect(item);
          break;
      }
    },
    [item.value, onSelect, onStateUpadte, parent?.state, state],
  );

  const handleExpand = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    state.expanded = !state.expanded;
    state.userInteraction = true;
    onStateUpadte();
  };

  const ariaLabelId = $.useId();

  const expandButton =
    item.children.length > 0
      ? $.html`
        <button
          aria-expanded=${state.expanded.toString()}
          aria-label=${state.expanded ? 'Shrink item' : 'Expand item'}
          class="TreeItem-expand"
          tabindex="-1"
          type="button"
          @click=${handleExpand}
        >
          <i
            aria-hidden="true"
            class=${
              state.expanded
                ? 'icon icon-16 icon-angle-down'
                : 'icon icon-16 icon-angle-right'
            }
            role="img"
          ></i>
        </button>
      `
      : null;

  return $.html`
    <div
      :class=${{ TreeItem: true, 'is-selected': item.selected }}
      :style=${{ '--level': state.level.toString() }}
      aria-labelledby=${ariaLabelId}
      aria-level=${state.level}
      aria-selected=${item.selected.toString()}
      role="treeitem"
      tabindex=${item.selected ? '0' : '-1'}
      @click=${handleClick}
      @keydown=${handleKeyDown}
    >
      <${expandButton}>
      <div class="TreeItem-content" id=${ariaLabelId}>
        <${children}>
      </div>
    </div>
  `;
});

function matchPrevious<T extends Element>(
  element: Element,
  predicate: (element: Element) => boolean,
): T | null {
  for (
    let current = element.previousElementSibling;
    current !== null;
    current = current.previousElementSibling
  ) {
    if (predicate(current)) {
      return current as T;
    }
  }
  return null;
}

function matchNext<T extends Element>(
  element: Element,
  predicate: (element: Element) => boolean,
): T | null {
  for (
    let current = element.nextElementSibling;
    current !== null;
    current = current.nextElementSibling
  ) {
    if (predicate(current)) {
      return current as T;
    }
  }
  return null;
}
