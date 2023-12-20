import React, {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from 'react';

import useEvent from '../hooks/useEvent';

interface MenuProps<TValue> {
  children?: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onSelect: (value: TValue) => void;
}

interface MenuItemProps<TValue> {
  icon?: React.ReactNode;
  isDisabled?: boolean;
  primaryText: string;
  secondaryText?: string;
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

export const Menu = forwardRef(MenuRoot) as <TValue>(
  props: MenuProps<TValue> & { ref?: React.ForwardedRef<MenuRef> },
) => ReturnType<typeof MenuRoot>;

function MenuRoot<TValue>(
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
      <div
        className="menu"
        onKeyDown={handleKeyDown}
        ref={containerRef}
        tabIndex={0}
      >
        {children}
      </div>
    </MenuContext.Provider>
  );
}

export function MenuItem<TValue>({
  icon,
  isDisabled = false,
  primaryText,
  secondaryText,
  value: value,
}: MenuItemProps<TValue>) {
  const { delegate } = useContext(MenuContext)!;

  const handleClick = useEvent(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      delegate(value);
    },
  );

  const iconElement = icon && <span className="menu-item-icon">{icon}</span>;

  const primaryTextElement = (
    <span className="menu-item-primary-text">{primaryText}</span>
  );
  const secondaryTextElement = secondaryText && (
    <span className="menu-item-secondary-text">{secondaryText}</span>
  );

  return (
    <button className="menu-item" disabled={isDisabled} onClick={handleClick}>
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
    <form className="menu-form" onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

function getFocusableElements(container: Element): {
  activeIndex: number;
  elements: HTMLElement[];
} {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>('.menu-item:not(.is-disabled)'),
  );
  const { activeElement } = document;
  const activeIndex = elements.findIndex((el) => el.contains(activeElement));
  return { activeIndex, elements };
}

function focusPrevious(container: Element): void {
  const { activeIndex, elements } = getFocusableElements(container);

  if (elements.length > 0) {
    const previousIndex =
      activeIndex > 0 ? activeIndex - 1 : elements.length - 1;
    const previousElement = elements[previousIndex]!;
    previousElement.focus();
  }
}

function focusNext(container: Element): void {
  const { activeIndex, elements } = getFocusableElements(container);

  if (elements.length > 0) {
    const nextIndex = activeIndex < elements.length - 1 ? activeIndex + 1 : 0;
    const nextElement = elements[nextIndex]!;
    nextElement.focus();
  }
}
