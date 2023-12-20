import classnames from 'classnames';
import React, { useMemo, useRef, useState } from 'react';

import debounce from 'feedpon-utils/debounce';
import useEvent from '../hooks/useEvent';
import Dismissible from './Dismissible';
import { Menu, MenuRef } from './Menu';

interface AutoCompleteProps<TItem, TValue> {
  completeDebounceTime?: number;
  defaultIsOpened?: boolean;
  items: TItem[];
  onClose?: () => void;
  onSelect?: (value: TValue) => void;
  onSubmit?: (query: string) => void;
  placeholder?: string;
  renderItems: (items: TItem[], query: string) => React.ReactNode;
}

export default function AutoComplete<TItem, TValue>({
  completeDebounceTime = 100,
  defaultIsOpened = false,
  placeholder,
  items,
  onClose,
  onSelect,
  onSubmit,
  renderItems,
}: AutoCompleteProps<TItem, TValue>) {
  const [isOpened, setIsOpened] = useState(defaultIsOpened);
  const [query, setQuery] = useState('');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<MenuRef | null>(null);

  const handleClose = useEvent(() => {
    setIsOpened(false);
    onClose?.();
  });

  const handleSubmit = useEvent((event: React.FormEvent) => {
    event.preventDefault();
    onSubmit?.(inputRef.current!.value);
  });

  const handleChange = useMemo(
    () =>
      debounce(() => {
        setIsOpened(true);
        setQuery(inputRef.current!.value);
      }, completeDebounceTime),
    [completeDebounceTime],
  );

  const handleKeyDown = useEvent((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        menuRef.current!.focusPrevious();
        break;

      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        menuRef.current!.focusNext();
        break;

      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();
        inputRef.current!.blur();
        setIsOpened(false);
        break;
    }
  });

  const handleFocus = useEvent(() => {
    setIsOpened(true);
  });

  const handleSelect = useEvent((value: TValue) => {
    setIsOpened(false);
    onSelect?.(value);
  });

  const filteredItems = useMemo(
    () => renderItems(items, query),
    [items, query, renderItems],
  );

  return (
    <Dismissible onDismiss={handleClose} isDisabled={!isOpened}>
      <div
        className={classnames('autocomplete', {
          'is-opened': isOpened,
        })}
      >
        <form className="autocomplete-form" onSubmit={handleSubmit}>
          <input
            className="input-search-box"
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            type="search"
          />
        </form>
        <div className="autocomplete-menu">
          <Menu<TValue>
            ref={menuRef}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
          >
            {filteredItems}
          </Menu>
        </div>
      </div>
    </Dismissible>
  );
}
