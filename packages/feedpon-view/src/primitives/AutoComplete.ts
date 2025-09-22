import {
  type Bindable,
  type Component,
  createComponent,
  type RenderContext,
} from 'barebind';

import { Menu, type MenuItem, type MenuRef } from './Menu.ts';
import { debounce } from './utils/debounce.ts';

interface AutoCompleteProps<T = unknown> {
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

export interface AutoComplete extends Component<AutoCompleteProps> {
  <T>(props: AutoCompleteProps<T>): Bindable<AutoCompleteProps<T>>;
}

export const AutoComplete: AutoComplete = createComponent(function AutoComplete<
  T,
>(
  {
    debounceTime = 100,
    placeholder,
    items,
    onSubmit,
    getFilteredItems,
  }: AutoCompleteProps<T>,
  $: RenderContext,
): unknown {
  const [open, setOpen] = $.useState(false);
  const [query, setQuery] = $.useState('');

  const autocompleteRef = $.useRef<HTMLDivElement | null>(null);
  const menuRef = $.useRef<MenuRef | null>(null);
  const inputRef = $.useRef<HTMLInputElement | null>(null);
  const triggerId = $.useId();

  const openDropdown = $.useCallback(() => {
    setOpen(true);
  }, []);

  const closeDropdown = $.useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = $.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onSubmit?.(inputRef.current!.value);
    },
    [onSubmit],
  );

  const handleInput = $.useMemo(
    () =>
      debounce(() => {
        setOpen(true);
        setQuery(inputRef.current!.value, { priority: 'background' });
      }, debounceTime),
    [debounceTime],
  );

  const handleKeyDown = $.useCallback((event: KeyboardEvent) => {
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

  const handleMenuToggle = $.useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  $.useLayoutEffect(() => {
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

  const filteredItems = $.useMemo(
    () => getFilteredItems(items, query, $),
    [items, query, getFilteredItems],
  );

  return $.html`
    <div
      :class=${{
        AutoComplete: true,
        'is-open': open,
      }}
      :ref=${autocompleteRef}
    >
      <form class="AutoComplete-form" @submit=${handleSubmit}>
        <input
          :ref=${inputRef}
          class="input-search-box"
          id=${triggerId}
          placeholder=${placeholder}
          type="search"
          @focus=${openDropdown}
          @input=${handleInput}
          @keydown=${handleKeyDown}
        >
      </form>
      <div class="AutoComplete-menu">
        <${Menu({
          items: filteredItems,
          target: triggerId,
          autoFocus: false,
          manual: true,
          onItemAction: closeDropdown,
          onMenuToggle: handleMenuToggle,
          open: open,
          ref: menuRef,
        })}>
      </div>
    </div>
  `;
});
