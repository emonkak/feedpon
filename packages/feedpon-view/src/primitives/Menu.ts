import type { RefObject, RenderContext, TemplateResult } from '@emonkak/ebit';
import { component, keyedList, memo, ref } from '@emonkak/ebit/directives.js';

export interface MenuProps {
  autoFocus?: boolean;
  items: MenuPrimitive[];
  manual?: boolean;
  onItemSelect?: (key: string) => void;
  onToggle?: (open: boolean) => void;
  open?: boolean;
  ref?: RefObject<MenuRef | null>;
  target: string;
}

export type MenuPrimitive =
  | MenuButton
  | MenuForm
  | MenuGroup
  | MenuLink
  | MenuSeparator;

export interface MenuButton {
  checked?: boolean;
  children: TemplateResult;
  disabled?: boolean;
  key: string;
  onAction?: (event: Event) => void;
  type: 'button';
}

export interface MenuLink {
  children: TemplateResult;
  href: string;
  key: string;
  onAction?: (event: Event) => void;
  type: 'link';
}

export interface MenuForm {
  ariaLabel: string;
  children: TemplateResult;
  key: string;
  onAction?: (event: Event) => void;
  type: 'form';
}

export interface MenuGroup {
  childItems: MenuPrimitive[];
  key: string;
  label: string;
  type: 'group';
}

export interface MenuSeparator {
  key: string;
  type: 'separator';
}

export interface MenuRef {
  focusNext(): void;
  focusPrevious(): void;
}

export type MenuPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

const FOCUSABLE_ELEMENT_SELECTOR =
  'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), details, [tabindex]:not([tabindex="-1"])';

export function Menu(
  {
    autoFocus = true,
    items,
    manual = false,
    onItemSelect,
    onToggle,
    open = false,
    ref: exposedRef = { current: null },
    target,
  }: MenuProps,
  context: RenderContext,
): TemplateResult {
  const menuRef = context.useRef<HTMLElement | null>(null);

  exposedRef.current = context.useMemo(
    () => ({
      focusPrevious() {
        focusPreviousItem(menuRef.current!);
      },
      focusNext() {
        focusNextItem(menuRef.current!);
      },
    }),
    [],
  );

  const handleKeyDown = context.useCallback((event: KeyboardEvent) => {
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
    }
  }, []);

  const handleToggle = context.useCallback(
    (event: ToggleEvent) => {
      onToggle?.(event.newState === 'open');
    },
    [onToggle],
  );

  context.useLayoutEffect(() => {
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

  const children = keyedList(
    items,
    (item) => item.key,
    (item) => renderPrimitive(item, onItemSelect, context),
  );

  return context.html`
    <div
      autofocus=${autoFocus}
      class="Menu"
      popover=${manual ? 'manual' : 'auto'}
      ref=${ref(menuRef)}
      role="menu"
      tabindex=${autoFocus ? '0' : false}
      @keydown=${handleKeyDown}
      @toggle=${handleToggle}
    >
      <${children}>
    </div>
  `;
}

interface ButtonProps {
  item: MenuButton;
  onItemSelect?: (key: string) => void;
}

interface FormProps {
  item: MenuForm;
  onItemSelect?: (key: string) => void;
}

interface GroupProps {
  item: MenuGroup;
  onItemSelect?: (key: string) => void;
}

interface LinkProps {
  item: MenuLink;
  onItemSelect?: (key: string) => void;
}

function Button(
  { item, onItemSelect }: ButtonProps,
  context: RenderContext,
): TemplateResult {
  const handleAction = context.useCallback(
    (event: Event) => {
      item.onAction?.(event);
      onItemSelect?.(item.key);
    },
    [item.key, item.onAction, onItemSelect],
  );

  return context.html`
    <button
      aria-checked=${item.checked?.toString()}
      class="MenuItem"
      data-key=${item.key}
      disabled=${item.disabled}
      role=${typeof item.checked === 'boolean' ? 'menuitemcheckbox' : 'menuitem'}
      type="button"
      @click=${handleAction}
    >
      <${item.children}>
    </button>
  `;
}

function Form(
  { item, onItemSelect }: FormProps,
  context: RenderContext,
): TemplateResult {
  const handleAction = context.useCallback(
    (event: Event) => {
      event.preventDefault();
      item.onAction?.(event);
      onItemSelect?.(item.key);
    },
    [item.key, item.onAction, onItemSelect],
  );

  return context.html`
    <form
      aria-label=${item.ariaLabel}
      class="MenuItem"
      data-key=${item.key}
      role="menuitem"
      @submit=${handleAction}
    >
      <${item.children}>
    </form>
  `;
}

function Group(
  { item, onItemSelect }: GroupProps,
  context: RenderContext,
): TemplateResult {
  const ariaLabelId = context.useId();

  const children = keyedList(
    item.childItems,
    (item) => item.key,
    (item) => renderPrimitive(item, onItemSelect, context),
  );

  return context.html`
    <section
      aria-labeledby=${ariaLabelId}
      class="MenuGroup"
      data-key=${item.key}
      role="group"
    >
      <header class="MenuGroup-label" id=${ariaLabelId}>${item.label}</header>
      <${children}>
    </section>
  `;
}

function Link(
  { item, onItemSelect }: LinkProps,
  context: RenderContext,
): TemplateResult {
  const handleAction = context.useCallback(
    (event: Event) => {
      item.onAction?.(event);
      onItemSelect?.(item.key);
    },
    [item.key, item.onAction, onItemSelect],
  );

  return context.html`
    <a
      @click=${handleAction}
      class="MenuItem"
      data-key=${item.key}
      href=${item.href}
      role="menuitem"
    >
      <${item.children}>
    </a>
  `;
}

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

function focusNextItem(element: HTMLElement): void {
  const children = getItemChildren(element);
  if (children.length > 0) {
    const activeIndex = activeElementIndex(children);
    const nextIndex = activeIndex < children.length - 1 ? activeIndex + 1 : 0;
    focusChild(children[nextIndex]!);
  }
}

function focusPreviousItem(element: HTMLElement): void {
  const children = getItemChildren(element);
  if (children.length > 0) {
    const activeIndex = activeElementIndex(children);
    const previousIndex =
      activeIndex > 0 ? activeIndex - 1 : children.length - 1;
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

function renderPrimitive(
  item: MenuPrimitive,
  onItemSelect: ((key: string) => void) | undefined,
  context: RenderContext,
): unknown {
  switch (item.type) {
    case 'button':
      return memo(
        () => component(Button, { item, onItemSelect }),
        [item, onItemSelect],
      );
    case 'form':
      return memo(
        () => component(Form, { item, onItemSelect }),
        [item, onItemSelect],
      );
    case 'group': {
      return memo(
        () => component(Group, { item, onItemSelect }),
        [item, onItemSelect],
      );
    }
    case 'link':
      return memo(
        () => component(Link, { item, onItemSelect }),
        [item, onItemSelect],
      );
    case 'separator':
      return context.html`<hr class="MenuSeparator">`;
  }
}
