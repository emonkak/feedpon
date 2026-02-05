import {
  createComponent,
  type RefObject,
  type RenderContext,
  Repeat,
  shallowEqual,
} from 'barebind';

export interface MenuProps {
  autoFocus?: boolean;
  items: MenuItem[];
  manual?: boolean;
  onItemAction?: (event: Event, key: string) => void;
  onMenuToggle?: (open: boolean) => void;
  open?: boolean;
  ref?: RefObject<MenuRef | null>;
  target: string;
}

export interface MenuRef {
  focusFirst(): void;
  focusLast(): void;
  focusNext(): void;
  focusPrevious(): void;
}

export type MenuPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type MenuItem =
  | MenuButton
  | MenuForm
  | MenuGroup
  | MenuLink
  | MenuSeparator;

interface MenuButton {
  checked?: boolean;
  children: unknown;
  disabled?: boolean;
  key: string;
  onAction?: (event: Event, key: string) => void;
  type: 'button';
}

interface MenuLink {
  children: unknown;
  href: string;
  key: string;
  onAction?: (event: Event, key: string) => void;
  type: 'link';
}

interface MenuForm {
  ariaLabel: string;
  children: unknown;
  key: string;
  onAction?: (event: Event, key: string) => void;
  type: 'form';
}

interface MenuGroup {
  childItems: MenuItem[];
  key: string;
  label: string;
  type: 'group';
}

interface MenuSeparator {
  key: string;
  type: 'separator';
}

const FOCUSABLE_ELEMENT_SELECTOR =
  'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), details, [tabindex]:not([tabindex="-1"])';

export const Menu = createComponent(function Menu(
  {
    autoFocus = true,
    items,
    manual = false,
    onItemAction,
    onMenuToggle,
    open = false,
    ref: exposedRef = { current: null },
    target,
  }: MenuProps,
  $: RenderContext,
): unknown {
  const menuRef = $.useRef<HTMLElement | null>(null);

  exposedRef.current = $.useMemo(
    () => ({
      focusFirst() {
        focusFirstItem(menuRef.current!);
      },
      focusLast() {
        focusLastItem(menuRef.current!);
      },
      focusPrevious() {
        focusPreviousItem(menuRef.current!);
      },
      focusNext() {
        focusNextItem(menuRef.current!);
      },
    }),
    [],
  );

  const handleKeyDown = $.useCallback((event: KeyboardEvent) => {
    if (
      !(
        event.target === event.currentTarget ||
        (event.target as Element).matches('.MenuItem')
      )
    ) {
      return;
    }
    const menuElement = event.currentTarget as HTMLDivElement;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        focusPreviousItem(menuElement);
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusNextItem(menuElement);
        break;
      case 'Home':
        event.preventDefault();
        focusFirstItem(menuElement);
        break;
      case 'End':
        event.preventDefault();
        focusLastItem(menuElement);
        break;
    }
  }, []);

  const handleToggle = $.useCallback(
    (event: ToggleEvent) => {
      onMenuToggle?.(event.newState === 'open');
    },
    [onMenuToggle],
  );

  $.useLayoutEffect(() => {
    const menu = menuRef.current!;

    if (open) {
      const trigger = document.getElementById(target);
      if (trigger !== null) {
        const { dataset, style } = menu;
        const anchorBounds = trigger.getBoundingClientRect();
        style.setProperty('--menu-top', anchorBounds.top + 'px');
        style.setProperty('--menu-right', anchorBounds.right + 'px');
        style.setProperty('--menu-bottom', anchorBounds.bottom + 'px');
        style.setProperty('--menu-left', anchorBounds.left + 'px');
        dataset['position'] = getMenuPosition(anchorBounds);
      }
      menu.showPopover();
    } else {
      menu.hidePopover();
    }
  }, [open]);

  const children = Repeat({
    elementSelector: (item) => renderItem(item, onItemAction, $),
    keySelector: (item) => item.key,
    source: items,
  });

  return $.html`
    <div
      :ref=${menuRef}
      autofocus=${autoFocus}
      class="Menu"
      popover=${manual ? 'manual' : 'auto'}
      role="menu"
      tabindex=${autoFocus ? '0' : false}
      @keydown=${handleKeyDown}
      @toggle=${handleToggle}
    >
      <${children}>
    </div>
  `;
});

const MenuButton = createComponent(
  function MenuButton(
    {
      item,
      onItemAction,
    }: {
      item: MenuButton;
      onItemAction?: ((event: Event, key: string) => void) | undefined;
    },
    $: RenderContext,
  ): unknown {
    const handleAction = $.useCallback(
      (event: Event) => {
        item.onAction?.(event, item.key);
        onItemAction?.(event, item.key);
      },
      [item.key, item.onAction, onItemAction],
    );

    return $.html`
      <button
        aria-checked=${item.checked?.toString()}
        class="MenuItem"
        disabled=${item.disabled}
        role=${typeof item.checked === 'boolean' ? 'menuitemcheckbox' : 'menuitem'}
        type="button"
        @click=${handleAction}
      >
        <${item.children}>
      </button>
    `;
  },
  { arePropsEqual: shallowEqual },
);

const MenuForm = createComponent(
  function MenuForm(
    {
      item,
      onItemAction,
    }: {
      item: MenuForm;
      onItemAction?: ((event: Event, key: string) => void) | undefined;
    },
    $: RenderContext,
  ): unknown {
    const handleAction = $.useCallback(
      (event: Event) => {
        item.onAction?.(event, item.key);
        onItemAction?.(event, item.key);
        event.preventDefault();
      },
      [item.key, item.onAction, onItemAction],
    );

    return $.html`
      <form
        aria-label=${item.ariaLabel}
        class="MenuItem"
        role="menuitem"
        @submit=${handleAction}
      >
        <${item.children}>
      </form>
    `;
  },
  { arePropsEqual: shallowEqual },
);

const MenuGroup = createComponent(
  function MenuGroup(
    {
      item,
      onItemAction,
    }: {
      item: MenuGroup;
      onItemAction?: ((event: Event, key: string) => void) | undefined;
    },
    $: RenderContext,
  ): unknown {
    const ariaLabelId = $.useId();

    const children = Repeat({
      elementSelector: (item) => renderItem(item, onItemAction, $),
      keySelector: (item) => item.key,
      source: item.childItems,
    });

    return $.html`
      <section
        aria-labeledby=${ariaLabelId}
        class="MenuGroup"
        role="group"
      >
        <header class="MenuGroup-label" id=${ariaLabelId}>${item.label}</header>
        <${children}>
      </section>
    `;
  },
  { arePropsEqual: shallowEqual },
);

const MenuLink = createComponent(
  function MenuLink(
    {
      item,
      onItemAction,
    }: {
      item: MenuLink;
      onItemAction?: ((event: Event, key: string) => void) | undefined;
    },
    $: RenderContext,
  ): unknown {
    const handleAction = $.useCallback(
      (event: Event) => {
        item.onAction?.(event, item.key);
        onItemAction?.(event, item.key);
      },
      [item.key, item.onAction, onItemAction],
    );

    return $.html`
    <a
      class="MenuItem"
      href=${item.href}
      role="menuitem"
      @click=${handleAction}
    >
      <${item.children}>
    </a>
  `;
  },
  { arePropsEqual: shallowEqual },
);

function activeElementIndex(children: ArrayLike<Element>) {
  const { activeElement } = document;
  if (activeElement !== null) {
    for (let i = 0, l = children.length; i < l; i++) {
      if (children[i]!.contains(activeElement)) {
        return i;
      }
    }
  }
  return -1;
}

function focusChild(element: HTMLElement): void {
  if (element.matches(FOCUSABLE_ELEMENT_SELECTOR)) {
    element.focus();
  } else {
    element.querySelector<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR)?.focus();
  }
}

function focusFirstItem(element: HTMLElement): void {
  const children = getItemChildren(element);
  if (children.length > 0) {
    focusChild(children[0]!);
  }
}

function focusLastItem(element: HTMLElement): void {
  const children = getItemChildren(element);
  if (children.length > 0) {
    focusChild(children[children.length - 1]!);
  }
}

function focusNextItem(element: HTMLElement): void {
  const children = getItemChildren(element);
  if (children.length > 0) {
    const selectedIndex = activeElementIndex(children);
    const nextIndex =
      selectedIndex < children.length - 1 ? selectedIndex + 1 : 0;
    focusChild(children[nextIndex]!);
  }
}

function focusPreviousItem(element: HTMLElement): void {
  const children = getItemChildren(element);
  if (children.length > 0) {
    const selectedIndex = activeElementIndex(children);
    const previousIndex =
      selectedIndex > 0 ? selectedIndex - 1 : children.length - 1;
    focusChild(children[previousIndex]!);
  }
}

function getItemChildren(element: Element): NodeListOf<HTMLElement> {
  return element.querySelectorAll<HTMLElement>('.MenuItem:not(:disabled)');
}

function getMenuPosition({ top, bottom, left, right }: DOMRect): MenuPosition {
  if (top > window.innerHeight - bottom) {
    return left > window.innerWidth - right ? 'top-left' : 'top-right';
  } else {
    return left > window.innerWidth - right ? 'bottom-left' : 'bottom-right';
  }
}

function renderItem(
  item: MenuItem,
  onItemAction: ((event: Event, key: string) => void) | undefined,
  $: RenderContext,
): unknown {
  switch (item.type) {
    case 'button':
      return MenuButton({ item, onItemAction });
    case 'form':
      return MenuForm({ item, onItemAction });
    case 'group':
      return MenuGroup({ item, onItemAction });
    case 'link':
      return MenuLink({ item, onItemAction });
    case 'separator':
      return $.html`<hr class="MenuSeparator">`;
  }
}
