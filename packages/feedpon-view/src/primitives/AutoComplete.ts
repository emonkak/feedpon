import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, component, ref } from '@emonkak/ebit/directives.js';
import debounce from 'feedpon-utils/debounce';

import { Menu, type MenuItem, type MenuRef } from './Menu';

interface AutoCompleteProps<T> {
  debounceTime?: number;
  items: T[];
  onSubmit?: (query: string) => void;
  placeholder?: string;
  getFilteredItems: (
    items: T[],
    query: string,
    context: RenderContext,
  ) => MenuItem[];
}

export function AutoComplete<T>(
  {
    debounceTime = 100,
    placeholder,
    items,
    onSubmit,
    getFilteredItems,
  }: AutoCompleteProps<T>,
  context: RenderContext,
): TemplateResult {
  const [open, setOpen] = context.useState(false);
  const [query, setQuery] = context.useState('');

  const autocompleteRef = context.useRef<HTMLDivElement | null>(null);
  const menuRef = context.useRef<MenuRef | null>(null);
  const inputRef = context.useRef<HTMLInputElement | null>(null);
  const triggerId = context.useId();

  const openDropdown = context.useCallback(() => {
    setOpen(true);
  }, []);

  const closeDropdown = context.useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = context.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onSubmit?.(inputRef.current!.value);
    },
    [onSubmit],
  );

  const handleInput = context.useMemo(
    () =>
      debounce(() => {
        setOpen(true);
        setQuery(inputRef.current!.value, 'background');
      }, debounceTime),
    [debounceTime],
  );

  const handleKeyDown = context.useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        event.stopPropagation();
        menuRef.current!.focusPrevious();
        break;
      case 'ArrowDown':
        event.preventDefault();
        event.stopPropagation();
        menuRef.current!.focusNext();
        break;
      case 'Home':
        event.preventDefault();
        event.stopPropagation();
        menuRef.current!.focusFirst();
        break;
      case 'End':
        event.preventDefault();
        event.stopPropagation();
        menuRef.current!.focusLast();
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        closeDropdown();
        break;
    }
  }, []);

  const handleMenuToggle = context.useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  context.useLayoutEffect(() => {
    const dissmissOnClickOutside = (event: MouseEvent) => {
      const container = autocompleteRef.current!;
      if (
        !event.defaultPrevented &&
        !container.contains(event.target as Element)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener('click', dissmissOnClickOutside);
    return () => {
      document.removeEventListener('click', dissmissOnClickOutside);
    };
  }, []);

  const filteredItems = context.useMemo(
    () => getFilteredItems(items, query, context),
    [items, query, getFilteredItems],
  );

  return context.html`
    <div
      class=${classMap({
        AutoComplete: true,
        'is-open': open,
      })}
      ref=${ref(autocompleteRef)}
    >
      <form class="AutoComplete-form" @submit=${handleSubmit}>
        <input
          class="input-search-box"
          id=${triggerId}
          placeholder=${placeholder}
          ref=${ref(inputRef)}
          type="search"
          @focus=${openDropdown}
          @input=${handleInput}
          @keydown=${handleKeyDown}
        >
      </form>
      <div class="AutoComplete-menu">
        <${component(Menu, {
          items: filteredItems,
          target: triggerId,
          autoFocus: false,
          manual: true,
          onItemAction: closeDropdown,
          onToggle: handleMenuToggle,
          open: open,
          ref: menuRef,
        })}>
      </div>
    </div>
  `;
}
