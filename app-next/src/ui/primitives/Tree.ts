import {
  createComponent,
  html,
  type VComponent,
  type VElement,
} from 'barebind';

const enum ControlStatus {
  NEUTRAL,
  EXPANDED,
  COLLAPSED,
}

export interface TreeProps {
  ariaLabel: string;
  children: VComponent<TreeItemProps>[];
}

export interface TreeItemProps {
  ariaLabel?: string;
  children?: VComponent<TreeItemProps>[];
  content: VElement | null | undefined;
  href: string;
  selected: boolean;
}

export const Tree = createComponent(function Tree({
  ariaLabel,
  children,
}: TreeProps) {
  return html`
    <div
      aria-label=${ariaLabel}
      class="Tree"
      focusgroup="menu"
      role="tree"
    >
      <${children}>
    </div>
  `;
});

export const TreeItem = createComponent(function TreeItem({
  children,
  content,
  href,
  selected,
}: TreeItemProps) {
  const [controllStatus, setControllStatus] = this.useState(
    ControlStatus.NEUTRAL,
  );
  const indirectlySelected = children?.some(isSelected) ?? false;
  const expanded = isExpanded(controllStatus, indirectlySelected);
  const toggle = (expanded: boolean) => {
    setControllStatus(
      indirectlySelected
        ? expanded
          ? ControlStatus.NEUTRAL
          : ControlStatus.COLLAPSED
        : expanded
          ? ControlStatus.EXPANDED
          : ControlStatus.NEUTRAL,
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (children === undefined) {
      return;
    }
    switch (event.key) {
      case ' ': // Space
        event.preventDefault();
        event.stopPropagation();
        toggle(!expanded);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        event.stopPropagation();
        toggle(false);
        break;
      case 'ArrowRight':
        event.preventDefault();
        event.stopPropagation();
        toggle(true);
        break;
      default:
        return;
    }
    if (event.currentTarget !== event.target) {
      (event.currentTarget as HTMLElement).querySelector('a')?.focus();
    }
  };
  const handleToggle = () => {
    toggle(!expanded);
  };

  return html`
    <div
      @keydown=${handleKeyDown}
      aria-selected=${selected.toString()}
      class=${['Tree-Item', { 'indirectly-selected': indirectlySelected, selected }]}
      role="treeitem"
    >
      <${
        children !== undefined
          ? html`
            <button
              @click=${handleToggle}
              aria-expanded=${expanded.toString()}
              class=${['Tree-Item-Toggle', { expanded }]}
              tabindex="-1"
            >
            </button>
          `
          : null
      }>
      <a
        class="Tree-Item-Cell"
        href=${href}
        tabindex="0"
      >
        <${content}>
      </a>
      <${
        expanded
          ? html`
            <div class="Tree-Item-Children" role="group">
              <${children}>
            </div>
          `
          : null
      }>
    </div>
  `;
});

function isExpanded(
  status: ControlStatus,
  indirectlySelected: boolean,
): boolean {
  switch (status) {
    case ControlStatus.EXPANDED:
      return true;
    case ControlStatus.COLLAPSED:
      return false;
    case ControlStatus.NEUTRAL:
      return indirectlySelected;
  }
}

function isSelected(element: VComponent<TreeItemProps>): boolean {
  const { selected, children } = element.props;
  return selected ? true : (children?.some(isSelected) ?? false);
}
