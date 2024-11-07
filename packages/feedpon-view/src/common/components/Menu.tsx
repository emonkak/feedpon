import React, {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from 'react';

import { useEvent } from '../../common/hooks/useEvent';

interface MenuProps<TValue> {
  children?: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onSelect: (value: TValue) => void;
}

interface MenuItemProps<TValue> {
  icon?: React.ReactNode;
  isDisabled?: boolean;
  label: string;
  hint?: string;
  value: TValue;
}

interface MenuFormProps<TValue> {
  children?: React.ReactNode;
  value: TValue;
}

interface MenuContext {
  delegate: (value: any) => void;
}

export interface MenuRef {
  focusNext(): void;
  focusPrevious(): void;
}

const KEY_EVENTS_TO_IGNORE = ['INPUT', 'SELECT', 'TEXTAREA'];

const MenuContext = createContext<MenuContext | null>(null);

export const Menu = forwardRef(function Menu<TValue>(
  { children, onKeyDown, onSelect }: MenuProps<TValue>,
  ref: React.ForwardedRef<MenuRef>,
) {
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => {
    return {
      focusNext() {
        containerRef.current && focusNext(containerRef.current);
      },
      focusPrevious() {
        containerRef.current && focusPrevious(containerRef.current);
      },
    };
  });

  const handleKeyDown = useEvent((event: React.KeyboardEvent<any>): void => {
    const target = event.target as Element;

    if (onKeyDown && !KEY_EVENTS_TO_IGNORE.includes(target.tagName)) {
      onKeyDown(event);
    }
  });

  return (
    <MenuContext.Provider value={{ delegate: onSelect }}>
      <div className="Menu" onKeyDown={handleKeyDown} ref={containerRef}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}) as <TValue>(
  props: MenuProps<TValue> & { ref?: React.ForwardedRef<MenuRef> },
) => React.ReactElement;

export function MenuItem<TValue>({
  icon,
  isDisabled = false,
  label,
  hint,
  value,
}: MenuItemProps<TValue>) {
  const { delegate } = useContext(MenuContext)!;

  const handleClick = useEvent(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      delegate(value);
    },
  );

  const iconElement = icon && <span className="MenuItem-icon">{icon}</span>;
  const primaryTextElement = <div className="MenuItem-content">{label}</div>;
  const secondaryTextElement = hint && (
    <div className="MenuItem-hint">{hint}</div>
  );

  return (
    <button
      type="button"
      className="menu-item"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {iconElement}
      {primaryTextElement}
      {secondaryTextElement}
    </button>
  );
}

export function MenuForm<TValue>({ children, value }: MenuFormProps<TValue>) {
  const { delegate } = useContext(MenuContext)!;

  const handleSubmit = useEvent((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    delegate(value);
  });

  return (
    <form className="MenuItem" onSubmit={handleSubmit}>
      {children}
    </form>
  );
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

function getFocusableItems(menu: Element): NodeListOf<HTMLElement> {
  return menu.querySelectorAll<HTMLElement>('.MenuItem:not(:disabled)');
}

function focusPrevious(menu: Element): void {
  const elements = getFocusableItems(menu);

  if (elements.length > 0) {
    const activeIndex = activeIndexOf(elements);
    const previousIndex =
      activeIndex > 0 ? activeIndex - 1 : elements.length - 1;
    const previousElement = elements[previousIndex]!;
    previousElement.focus();
  }
}

function focusNext(menu: Element): void {
  const elements = getFocusableItems(menu);

  if (elements.length > 0) {
    const activeIndex = activeIndexOf(elements);
    const nextIndex = activeIndex < elements.length - 1 ? activeIndex + 1 : 0;
    const nextElement = elements[nextIndex]!;
    nextElement.focus();
  }
}
