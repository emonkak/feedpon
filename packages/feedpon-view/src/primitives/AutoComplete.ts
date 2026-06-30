import {
  type Component,
  createComponent,
  html,
  type RenderContext,
  type VComponent,
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
  <T>(props: AutoCompleteProps<T>): VComponent<AutoCompleteProps<T>>;
}

export const AutoComplete: AutoComplete = createComponent(function AutoComplete<
  T,
>(
  this: RenderContext,
  {
    debounceTime = 100,
    placeholder,
    items,
    onSubmit,
    getFilteredItems,
  }: AutoCompleteProps<T>,
) {
  const [open, setOpen] = this.useState(false);
  const [query, setQuery] = this.useState('');

  const autocompleteRef = this.useRef<HTMLDivElement | null>(null);
  const menuRef = this.useRef<MenuRef | null>(null);
  const inputRef = this.useRef<HTMLInputElement | null>(null);
  const triggerId = this.useId();

  const openDropdown = this.useCallback(() => {
    setOpen(true);
  }, []);

  const closeDropdown = this.useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = this.useCallback(
    (event: SubmitEvent) => {
      event.preventDefault();
      onSubmit?.(inputRef.current!.value);
    },
    [onSubmit],
  );

  const handleInput = this.useMemo(
    () =>
      debounce(() => {
        setOpen(true);
        setQuery(inputRef.current!.value, { priority: 'background' });
      }, debounceTime),
    [debounceTime],
  );

  const handleKeyDown = this.useCallback((event: KeyboardEvent) => {
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

  const handleMenuToggle = this.useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  this.useEffect(() => {
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

  const filteredItems = this.useMemo(
    () => getFilteredItems(items, query, this),
    [items, query, getFilteredItems],
  );

  return html`
    <div
      class=${{
        AutoComplete: true,
        'is-open': open,
      }}
      ${autocompleteRef}
    >
      <form class="AutoComplete-form" @submit=${handleSubmit}>
        <input
          class="input-search-box"
          id=${triggerId}
          placeholder=${placeholder}
          type="search"
          @focus=${openDropdown}
          @input=${handleInput}
          @keydown=${handleKeyDown}
          ${inputRef}
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
