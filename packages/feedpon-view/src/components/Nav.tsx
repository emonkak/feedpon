import classnames from 'classnames';
import React, { createContext, useContext } from 'react';

import useEvent from '../hooks/useEvent';

interface NavProps<TValue> {
  children?: React.ReactNode;
  onSelect: (value: TValue) => void;
}

interface NavContext {
  delegate: (value: any) => void;
}

interface NavItemProps {
  children?: React.ReactNode;
  isSelected?: boolean;
  title?: string;
  value: any;
}

const NavContext = createContext<NavContext | null>(null);

export function Nav<TValue>({ children, onSelect }: NavProps<TValue>) {
  return (
    <NavContext.Provider value={{ delegate: onSelect }}>
      <nav className="nav">{children}</nav>
    </NavContext.Provider>
  );
}

export function NavItem({
  isSelected = false,
  children,
  title,
  value,
}: NavItemProps) {
  const { delegate } = useContext(NavContext)!;

  const handleSelect = useEvent((event: React.MouseEvent<any>) => {
    event.preventDefault();
    delegate(value);
  });

  if (isSelected) {
    return (
      <span
        className={classnames('nav-item', {
          'is-selected': isSelected,
        })}
        title={title}
      >
        {children}
      </span>
    );
  } else {
    return (
      <a
        className={classnames('nav-item', {
          'is-selected': isSelected,
        })}
        href="#"
        title={title}
        onClick={handleSelect}
      >
        {children}
      </a>
    );
  }
}
