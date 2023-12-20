import React, { cloneElement, useRef, useState } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

import useEvent from '../hooks/useEvent';
import Dismissible from './Dismissible';
import { Menu, MenuRef } from './Menu';

interface DropdownProps<TValue> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  onClose?: () => void;
  onSelect: (value: TValue) => void;
  toggleButton: React.ReactElement<ToggleButtonProps>;
}

interface ToggleButtonProps {
  onClick?: (event: React.MouseEvent<any>) => void;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
}

export default function Dropdown<TValue>({
  as: As = 'div',
  children,
  className,
  onClose,
  onSelect,
  toggleButton,
}: DropdownProps<TValue>) {
  const [isOpened, setIsOpened] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const containerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<MenuRef>(null);

  const openDropdown = () => {
    if (!containerRef.current) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const topSpace = containerRect.top;
    const bottomSpace = viewportHeight - containerRect.bottom;
    const leftSpace = containerRect.left;
    const rightSpace = viewportWidth - containerRect.right;

    let dropdownStyle: React.CSSProperties = {};

    if (leftSpace <= rightSpace) {
      dropdownStyle.left = containerRect.left;
      dropdownStyle.maxWidth = `calc(100% - ${containerRect.left}px)`;
    } else {
      dropdownStyle.right = `calc(100% - ${containerRect.right}px)`;
      dropdownStyle.maxWidth = `calc(100% - (100% - ${containerRect.right}px))`;
    }

    if (topSpace <= bottomSpace) {
      dropdownStyle.top = containerRect.bottom;
      dropdownStyle.maxHeight = `calc(100% - ${containerRect.bottom}px)`;
    } else {
      dropdownStyle.bottom = `calc(100% - ${containerRect.top}px)`;
      dropdownStyle.maxHeight = `calc(100% - (100% - ${containerRect.top}px))`;
    }

    setIsOpened(true);
    setDropdownStyle(dropdownStyle);
  };

  const closeDropdown = () => {
    onClose?.();
    setIsOpened(false);
  };

  const handleDismiss = useEvent(() => {
    closeDropdown();
  });

  const handleToggle = useEvent((event: React.MouseEvent<any>): void => {
    event.preventDefault();

    if (isOpened) {
      closeDropdown();
    } else {
      openDropdown();
    }

    toggleButton.props.onClick?.(event);
  });

  const handleKeyDown = useEvent((event: React.KeyboardEvent<any>): void => {
    if (menuRef.current) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
          menuRef.current.focusPrevious();
          break;

        case 'ArrowDown':
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
          menuRef.current.focusNext();
          break;

        case 'Escape':
          event.preventDefault();
          event.stopPropagation();
          event.nativeEvent.stopImmediatePropagation();
          closeDropdown();
          break;
      }
    }

    toggleButton.props.onKeyDown?.(event);
  });

  const handleSelect = (value: TValue): void => {
    onSelect?.(value);
    closeDropdown();
  };

  const handleTransitionEntered = useEvent(() => {
    setIsEntered(true);
  });

  const handleTransitionExited = useEvent(() => {
    setIsEntered(false);
  });

  return (
    <As ref={containerRef} className={className}>
      {cloneElement(toggleButton, {
        onClick: handleToggle,
        onKeyDown: handleKeyDown,
      })}
      <CSSTransition
        in={isOpened}
        mountOnEnter
        unmountOnExit
        classNames="menu"
        timeout={200}
        onEntered={handleTransitionEntered}
        onExited={handleTransitionExited}
      >
        <Dismissible isDisabled={!isEntered} onDismiss={handleDismiss}>
          <div className="dropdown" style={dropdownStyle}>
            <Menu<TValue>
              ref={menuRef}
              onKeyDown={handleKeyDown}
              onSelect={handleSelect}
            >
              {children}
            </Menu>
          </div>
        </Dismissible>
      </CSSTransition>
    </As>
  );
}
