import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { ref } from '@emonkak/ebit/directives.js';

export interface MenuProps {
  anchorTarget: string;
  children: TemplateResult;
  onClose?: () => void;
  open: boolean;
  preferredPosition?: MenuPosition;
}

export interface AnchorBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type MenuPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

const FOCUSABLE_ELEMENT_SELECTOR =
  'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';

export function Menu(
  { anchorTarget, children, onClose, open, preferredPosition }: MenuProps,
  context: RenderContext,
): TemplateResult {
  const menuRef = context.useRef<HTMLElement | null>(null);

  const handleKeyDown = context.useCallback(
    (event: KeyboardEvent) => {
      if (
        event.target !== event.currentTarget &&
        !(event.target as Element).matches('.MenuItem')
      ) {
        return;
      }
      const target = event.currentTarget as HTMLDivElement;
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          focusPrevious(getFocusableItems(target));
          break;
        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          focusNext(getFocusableItems(target));
          break;
        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          target.blur();
          onClose?.();
          break;
      }
    },
    [onClose],
  );

  const handleToggle = context.useCallback(
    (event: ToggleEvent) => {
      if (event.newState === 'closed') {
        onClose?.();
      }
    },
    [onClose],
  );

  context.useLayoutEffect(() => {
    const menu = menuRef.current!;

    if (open) {
      const anchor = document.getElementById(anchorTarget);
      if (anchor !== null) {
        const { dataset, style } = menu;
        const anchorBounds = anchor.getBoundingClientRect();
        style.setProperty('--anchor-top', anchorBounds.top + 'px');
        style.setProperty('--anchor-right', anchorBounds.right + 'px');
        style.setProperty('--anchor-bottom', anchorBounds.bottom + 'px');
        style.setProperty('--anchor-left', anchorBounds.left + 'px');
        dataset['position'] =
          preferredPosition ?? getMenuPosition(anchorBounds);
      }
      menu.showPopover();
    } else {
      menu.hidePopover();
    }
  }, [open, preferredPosition]);

  return context.html`
    <div
      autofocus
      class="Menu"
      popover
      ref=${ref(menuRef)}
      role="menu"
      tabindex="0"
      @keydown=${handleKeyDown}
      @toggle=${handleToggle}
    >
      <${children}>
    </div>
  `;
}

function activeIndexOf(elements: ArrayLike<Element>) {
  const { activeElement } = document;
  for (let i = 0, l = elements.length; i < l; i++) {
    if (elements[i]!.contains(activeElement)) {
      return i;
    }
  }
  return -1;
}

function focusNext(items: NodeListOf<HTMLElement>): void {
  if (items.length > 0) {
    const activeIndex = activeIndexOf(items);
    const nextIndex = activeIndex < items.length - 1 ? activeIndex + 1 : 0;
    focusElement(items[nextIndex]!);
  }
}

function focusPrevious(items: NodeListOf<HTMLElement>): void {
  if (items.length > 0) {
    const activeIndex = activeIndexOf(items);
    const previousIndex = activeIndex > 0 ? activeIndex - 1 : items.length - 1;
    focusElement(items[previousIndex]!);
  }
}

function focusElement(element: HTMLElement): void {
  if (element.matches(FOCUSABLE_ELEMENT_SELECTOR)) {
    element.focus();
  } else {
    element.querySelector<HTMLElement>(FOCUSABLE_ELEMENT_SELECTOR)?.focus();
  }
}

function getFocusableItems(menu: Element): NodeListOf<HTMLElement> {
  return menu.querySelectorAll<HTMLElement>('.MenuItem:not(:disabled)');
}

function getMenuPosition({
  top,
  bottom,
  left,
  right,
}: AnchorBounds): MenuPosition {
  if (top > window.innerHeight - bottom) {
    return left > window.innerWidth - right ? 'top-left' : 'top-right';
  } else {
    return left > window.innerWidth - right ? 'bottom-left' : 'bottom-right';
  }
}
