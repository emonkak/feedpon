import type { RenderContext, TemplateResult } from '@emonkak/ebit';
import { classMap, component, memo, ref } from '@emonkak/ebit/directives.js';
import debounce from 'feedpon-utils/debounce';

import { Menu, type MenuRef } from './Menu';

interface AutoCompleteProps<T> {
  debounceTime?: number;
  items: T[];
  onSubmit?: (query: string) => void;
  placeholder?: string;
  renderItems: (
    items: T[],
    query: string,
    closeDropdown: () => void,
    context: RenderContext,
  ) => TemplateResult;
}

export function AutoComplete<T>(
  {
    debounceTime = 100,
    placeholder,
    items,
    onSubmit,
    renderItems,
  }: AutoCompleteProps<T>,
  context: RenderContext,
): TemplateResult {
  const [isOpened, setIsOpened] = context.useState(false);
  const [query, setQuery] = context.useState('');

  const autocompleteRef = context.useRef<HTMLDivElement | null>(null);
  const menuRef = context.useRef<MenuRef | null>(null);
  const inputRef = context.useRef<HTMLInputElement | null>(null);
  const inputId = context.useId();

  const openDropdown = context.useCallback(() => {
    setTimeout(() => setIsOpened(true), 0);
  }, []);

  const closeDropdown = context.useCallback(() => {
    setIsOpened(false);
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
        setIsOpened(true);
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
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        closeDropdown();
        break;
    }
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

  const menuChildren = memo(
    () => renderItems(items, query, closeDropdown, context),
    [items, query, renderItems],
  );

  return context.html`
    <div
      class=${classMap({
        Autocomplete: true,
        'is-opened': isOpened,
      })}
      ref=${ref(autocompleteRef)}
    >
      <form class="Autocomplete-form" @submit=${handleSubmit}>
        <input
          class="input-search-box"
          id=${inputId}
          placeholder=${placeholder}
          ref=${ref(inputRef)}
          type="search"
          @focus=${openDropdown}
          @input=${handleInput}
          @keydown=${handleKeyDown}
        >
      </form>
      <div class="Autocomplete-menu">
        <${component(Menu, {
          anchorTarget: inputId,
          autoFocus: false,
          children: menuChildren,
          manual: true,
          onClose: closeDropdown,
          open: isOpened,
          ref: menuRef,
        })}>
      </div>
    </div>
  `;
}
